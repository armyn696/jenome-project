import json
import google.generativeai as genai
import re
import os
from dotenv import load_dotenv

load_dotenv()

def clean_mermaid_code(response_text):
    """پاکسازی و استخراج کد Mermaid از پاسخ"""
    # حذف بک‌تیک‌ها و کلمه mermaid
    cleaned = re.sub(r'```mermaid\s*|\s*```', '', response_text)
    
    # پردازش خط به خط
    lines = []
    for line in cleaned.split('\n'):
        if line.strip():
            # حذف پرانتزهای تودرتو
            line = re.sub(r'\((.*?)\((.*?)\)\)', r'(\1 \2)', line)
            
            # حذف پرانتزهای اضافی داخل پرانتز اصلی
            while '((' in line or '))' in line:
                line = line.replace('((', '(').replace('))', ')')
            
            # اطمینان از وجود فقط یک جفت پرانتز در هر بخش
            parts = line.split('(')
            if len(parts) > 2:
                main_part = parts[0]
                content_parts = [p.strip(' )') for p in parts[1:]]
                line = f"{main_part}({' '.join(content_parts)})"
            
            lines.append(line)
    
    # اطمینان از شروع با mindmap
    result = '\n'.join(lines)
    if not result.strip().startswith('mindmap'):
        result = 'mindmap\n' + result
        
    return result

def generate_mermaid_code(input_text):
    """تبدیل متن به کد Mermaid"""
    try:
        GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
        if not GEMINI_API_KEY:
            raise Exception("کلید API یافت نشد")
            
        genai.configure(api_key=GEMINI_API_KEY)
        
        generation_config = {
            "temperature": 0.9,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 8192,
        }

        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-exp",
            generation_config=generation_config,
        )
        
        prompt = """
        لطفاً متن زیر را به یک نمودار ذهنی (mindmap) در Mermaid تبدیل کن. این نمودار باید:

        1. تمام جزئیات متن را به طور کامل پوشش دهد
        2. هر شاخه را با توضیحات کافی و جزئیات مرتبط پر کند
        3. ساختار سلسله مراتبی با عمق مناسب داشته باشد
        4. از جملات و عبارات نسبتاً کوتاه برای توصیف هر شاخه استفاده کند

        متن:
        """

        chat = model.start_chat(history=[])
        response = chat.send_message(prompt + input_text)
        
        if response.text:
            return clean_mermaid_code(response.text)
        else:
            raise Exception("پاسخی از API دریافت نشد")

    except Exception as e:
        return str(e)

def handler(event, context):
    """تابع اصلی Netlify Function"""
    try:
        # بررسی متد درخواست
        if event['httpMethod'] != 'POST':
            return {
                'statusCode': 405,
                'body': json.dumps({'error': 'Method Not Allowed'})
            }

        # دریافت داده‌های ورودی
        body = json.loads(event['body'])
        input_text = body.get('text')

        if not input_text:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'No input text provided'})
            }

        # تولید کد Mermaid
        mermaid_code = generate_mermaid_code(input_text)

        # برگرداندن پاسخ
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'  # CORS
            },
            'body': json.dumps({
                'mermaid_code': mermaid_code
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        } 