import { useState, useEffect } from 'react';
import { getTables, addTable, updateTable, deleteTable } from '../services/api';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTableNumber, setNewTableNumber] = useState('');

  const fetchTables = async () => {
    try {
      const res = await getTables();
      setTables(res.data);
    } catch (err) {
      console.error("Failed to fetch tables", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableNumber) return;
    try {
      await addTable(parseInt(newTableNumber));
      setNewTableNumber('');
      fetchTables();
    } catch (err) {
      console.error("Failed to add table", err);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this table?')) {
        try {
            await deleteTable(id);
            fetchTables();
        } catch (err) {
            console.error("Failed to delete table", err);
        }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800 border-green-200';
      case 'Occupied': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Bill Pending': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) return <div>Loading tables...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Table Management</h1>
        <form onSubmit={handleAddTable} className="flex gap-2">
            <input 
                type="number" 
                value={newTableNumber} 
                onChange={(e) => setNewTableNumber(e.target.value)} 
                placeholder="Table No." 
                className="border border-gray-300 rounded-lg px-3 py-2 w-24 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required 
            />
            <button type="submit" className="cafe-button flex items-center gap-1">
                <FiPlus /> Add
            </button>
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tables.map(table => (
          <div key={table.id} className={`border rounded-xl p-4 flex flex-col justify-between h-32 transition-transform hover:scale-105 ${getStatusColor(table.status)}`}>
            <div className="flex justify-between items-start">
                <span className="font-bold text-lg">Table {table.table_number}</span>
                <button onClick={() => handleDelete(table.id)} className="text-gray-500 hover:text-red-500"><FiTrash2 /></button>
            </div>
            <div className="flex justify-between items-end">
                <span className="text-sm font-medium">{table.status}</span>
                <Link to={`/pos/${table.id}`} className="text-sm bg-white bg-opacity-50 hover:bg-opacity-100 px-2 py-1 rounded transition-colors font-medium">
                    Order
                </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tables;
