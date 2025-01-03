import { PDFViewer } from "@/components/PDFViewer";

const Index = () => {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent">
      <div className="max-w-[99%] mx-auto">
        <div className="h-[85vh] max-w-[1600px] mx-auto px-2">
          <PDFViewer />
        </div>
      </div>
    </div>
  );
};

export default Index;