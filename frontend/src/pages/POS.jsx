import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMenu, getTables, getOrderByTable, createOrUpdateOrder, generateBill } from '../services/api';
import { FiPlus, FiMinus, FiTrash2, FiPrinter } from 'react-icons/fi';

const POS = () => {
    const { tableId } = useParams();
    const navigate = useNavigate();

    const [menuItems, setMenuItems] = useState([]);
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(tableId || '');
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Bill preview state
    const [showBillPreview, setShowBillPreview] = useState(false);
    const [billData, setBillData] = useState(null);

    const categories = ['All', 'Coffee', 'Tea', 'Cold Beverages', 'Snacks', 'Sandwiches', 'Desserts', 'Special Items'];

    useEffect(() => {
        const initData = async () => {
            try {
                const [menuRes, tablesRes] = await Promise.all([getMenu(), getTables()]);
                setMenuItems(menuRes.data.filter(i => i.is_available));
                setTables(tablesRes.data);

                if (tableId) {
                    try {
                        const orderRes = await getOrderByTable(tableId);
                        if (orderRes.data && orderRes.data.items) {
                            setOrderItems(orderRes.data.items.map(i => ({
                                ...i,
                                price: i.price,
                                name: i.menu_item_name
                            })));
                        }
                    } catch (err) {
                        // No pending order for this table
                        setOrderItems([]);
                    }
                }
            } catch (err) {
                console.error("Failed to init POS", err);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [tableId]);

    const handleTableChange = async (e) => {
        const newTableId = e.target.value;
        setSelectedTable(newTableId);
        navigate(`/pos/${newTableId}`);
    };

    const addToOrder = (menuItem) => {
        const existing = orderItems.find(i => i.menu_item_id === menuItem.id);
        if (existing) {
            setOrderItems(orderItems.map(i => i.menu_item_id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setOrderItems([...orderItems, {
                menu_item_id: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: 1,
                special_instructions: ''
            }]);
        }
    };

    const updateQuantity = (id, delta) => {
        setOrderItems(orderItems.map(i => {
            if (i.menu_item_id === id) {
                const newQ = i.quantity + delta;
                return newQ > 0 ? { ...i, quantity: newQ } : i;
            }
            return i;
        }));
    };

    const removeItem = (id) => {
        setOrderItems(orderItems.filter(i => i.menu_item_id !== id));
    };

    const handleSaveOrder = async () => {
        if (!selectedTable) return alert("Please select a table");
        if (orderItems.length === 0) return alert("Order is empty");

        try {
            await createOrUpdateOrder({ table_id: selectedTable, items: orderItems });
            alert("Order saved successfully");
            // Refresh table data
        } catch (err) {
            console.error("Failed to save order", err);
            alert("Error saving order");
        }
    };

    const handleGenerateBill = async () => {
        if (!selectedTable) return alert("Please select a table");

        try {
            // First save the order
            const saveRes = await createOrUpdateOrder({ table_id: selectedTable, items: orderItems });

            // Then generate bill
            const billRes = await generateBill(saveRes.data.order_id);
            setBillData(billRes.data.bill);
            setShowBillPreview(true);
        } catch (err) {
            console.error("Failed to generate bill", err);
            alert("Error generating bill");
        }
    };

    const handlePrint = async () => {
        // Basic print for now, can be extended for Bluetooth
        window.print();
    };

    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const grandTotal = subtotal + tax;

    const filteredMenu = menuItems.filter(item => categoryFilter === 'All' || item.category === categoryFilter);

    if (loading) return <div>Loading POS...</div>;

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)]">
            {/* Menu Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex gap-4 overflow-x-auto pb-4 mb-4 hide-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-colors ${categoryFilter === cat ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20 lg:pb-0 pr-2">
                    {filteredMenu.map(item => (
                        <div key={item.id} onClick={() => addToOrder(item)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer transition-transform hover:scale-105 flex flex-col justify-between">
                            <h3 className="font-bold text-gray-800 line-clamp-2">{item.name}</h3>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm text-gray-500">{item.category}</span>
                                <span className="font-bold text-primary">₹{item.price.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Current Order Area */}
            <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden fixed lg:static bottom-0 left-0 right-0 z-10 lg:z-auto h-2/3 lg:h-auto translate-y-full lg:translate-y-0 transition-transform data-[open=true]:translate-y-0" data-open="true">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Current Order</h2>
                    <select value={selectedTable} onChange={handleTableChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary">
                        <option value="">Select Table</option>
                        {tables.map(t => <option key={t.id} value={t.id}>Table {t.table_number} ({t.status})</option>)}
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {orderItems.length === 0 ? (
                        <div className="text-center text-gray-500 my-10">Select items from the menu to start order</div>
                    ) : (
                        orderItems.map(item => (
                            <div key={item.menu_item_id} className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                                    <div className="text-sm text-gray-500">₹{item.price} x {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQuantity(item.menu_item_id, -1)} className="p-1 bg-gray-100 rounded text-gray-600 hover:bg-gray-200"><FiMinus /></button>
                                    <span className="w-6 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.menu_item_id, 1)} className="p-1 bg-gray-100 rounded text-gray-600 hover:bg-gray-200"><FiPlus /></button>
                                    <button onClick={() => removeItem(item.menu_item_id)} className="p-1 ml-2 text-red-500 hover:bg-red-50 rounded"><FiTrash2 /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between text-gray-600"><span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span></div>
                        <div className="flex justify-between text-xl font-bold text-gray-800 border-t pt-2"><span>Total</span><span>₹{grandTotal.toFixed(2)}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={handleSaveOrder} className="px-4 py-3 bg-white border-2 border-primary text-primary rounded-lg font-bold hover:bg-gray-50 transition-colors">Save / Send</button>
                        <button onClick={handleGenerateBill} className="px-4 py-3 bg-primary text-white rounded-lg font-bold hover:bg-accent transition-colors">Generate Bill</button>
                    </div>
                </div>
            </div>

            {/* Bill Preview Modal */}
            {showBillPreview && billData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:bg-white print:p-0">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:max-h-none print:w-full">

                        {/* Printable Receipt Area */}
                        <div id="receipt-area" className="p-6 overflow-y-auto font-mono text-sm print:p-0 text-center">
                            <h2 className="text-xl font-bold mb-1">Kalakarz Town</h2>
                            <p className="text-xs mb-4 text-gray-600">123 Coffee Street, Foodville<br />GST: 22AAAAA0000A1Z5</p>

                            <div className="text-left mb-4 border-y border-dashed border-gray-400 py-2">
                                <p>Bill No: {billData.bill_number}</p>
                                <p>Date: {billData.date}</p>
                                <p>Table: {billData.table_number}</p>
                            </div>

                            <table className="w-full text-left mb-4 border-b border-dashed border-gray-400 pb-2">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="py-1">Item</th>
                                        <th className="py-1 text-center">Qty</th>
                                        <th className="py-1 text-right">Amt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billData.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="py-1">{item.name}</td>
                                            <td className="py-1 text-center">{item.quantity}</td>
                                            <td className="py-1 text-right">{(item.total).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="text-right space-y-1 mb-4">
                                <p>Subtotal: ₹{billData.subtotal.toFixed(2)}</p>
                                <p>CGST (2.5%): ₹{(billData.tax_amount / 2).toFixed(2)}</p>
                                <p>SGST (2.5%): ₹{(billData.tax_amount / 2).toFixed(2)}</p>
                                <p className="font-bold text-lg border-t border-dashed border-gray-400 pt-2 mt-2">Grand Total: ₹{billData.grand_total.toFixed(2)}</p>
                            </div>

                            <p className="text-center mt-6 font-bold">Thank You!<br />Visit Again</p>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-2 print:hidden">
                            <button onClick={() => { setShowBillPreview(false); setOrderItems([]); setSelectedTable(''); }} className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-100">Close</button>
                            <button onClick={handlePrint} className="px-4 py-2 bg-primary text-white rounded hover:bg-accent flex items-center justify-center gap-2"><FiPrinter /> Print</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POS;
