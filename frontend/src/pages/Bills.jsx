import { useState, useEffect } from 'react';
import { getBills } from '../services/api';
import { FiDownload, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await getBills();
        setBills(res.data);
      } catch (err) {
        console.error("Failed to fetch bills", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  const handleEdit = async (bill) => {

    const newAmount = prompt(
      "Enter new bill amount",
      bill.grand_total
    );

    if (newAmount === null) return;

    try {

      await updateBill(bill.id, {
        grand_total: parseFloat(newAmount)
      });

      setBills(
        bills.map((b) =>
          b.id === bill.id
            ? {
              ...b,
              grand_total: parseFloat(newAmount)
            }
            : b
        )
      );

      alert("Bill updated successfully");

    } catch (error) {

      console.error("Update failed:", error);
      alert("Failed to update bill");

    }

  };

  const downloadPDF = (bill) => {
    const doc = new jsPDF();
    doc.text(`Kalakar'z Town - Bill ${bill.bill_number}`, 14, 15);
    doc.text(`Date: ${new Date(bill.created_at).toLocaleString()}`, 14, 25);
    doc.text(`Table: ${bill.table_number}`, 14, 35);

    doc.autoTable({
      startY: 45,
      head: [['Description', 'Amount']],
      body: [
        ['Subtotal', `INR ${bill.subtotal.toFixed(2)}`],
        ['Tax (5%)', `INR ${bill.tax_amount.toFixed(2)}`],
        ['Grand Total', `INR ${bill.grand_total.toFixed(2)}`]
      ],
    });

    doc.save(`bill_${bill.bill_number}.pdf`);
  };
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this bill?"
    );

    if (!confirmDelete) return;

    try {
      await deleteBill(id);

      setBills(
        bills.filter((bill) => bill.id !== id)
      );

      alert("Bill deleted successfully");

    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete bill");
    }
  };
  const filteredBills = bills.filter(b => b.bill_number.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div>Loading bills...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Order History & Bills</h1>
        <div className="relative w-full md:w-64">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input type="text" placeholder="Search bill number..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBills.map((bill) => (
              <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{bill.bill_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(bill.created_at).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bill.table_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{bill.grand_total.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                  <div className="flex justify-end gap-3">

                    <button
                      onClick={() => downloadPDF(bill)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Download PDF"
                    >
                      <FiDownload />
                    </button>

                    <button
                      onClick={() => handleEdit(bill)}
                      className="text-green-600 hover:text-green-800"
                      title="Edit Bill"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      onClick={() => handleDelete(bill.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Bill"
                    >
                      <FiTrash2 />
                    </button>

                  </div>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBills.length === 0 && <div className="p-6 text-center text-gray-500">No bills found.</div>}
      </div>
    </div>
  );
};

export default Bills;
