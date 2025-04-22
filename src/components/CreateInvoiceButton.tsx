
import { Button } from "./ui/button";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

const CreateInvoiceButton = () => {
  return (
    <Link to="/app/invoices/new">
      <Button className="bg-invoice-orange hover:bg-invoice-orange/90">
        <FileText className="w-4 h-4 mr-2" />
        Create invoice
      </Button>
    </Link>
  );
};

export default CreateInvoiceButton;
