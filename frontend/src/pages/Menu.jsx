import { useState, useEffect } from 'react';
import { getMenu, addMenuItem, updateMenuItem, deleteMenuItem } from '../services/api';
import { FiPlus, FiTrash2, FiEdit2, FiSearch } from 'react-icons/fi';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Current Item with Quantity Support
  const [currentItem, setCurrentItem] = useState({
    name: '',
    category: 'Stater',
    quantity: 'Full',
    price: ''
  });

  const categories = [
    'All',
    'Stater',
    'Soup',
    'Cold Beverages',
    'Rice',
    'Noodels',
    'Paneer rice',
    'Paneer noodels',
    'Kalakarz Special Items'
  ];


  // Fetch Menu Items
  const fetchMenu = async () => {
    try {
      const res = await getMenu();
      setMenuItems(res.data);
    } catch (err) {
      console.error("Failed to fetch menu", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchMenu();
  }, []);


  // Add or Update Item
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const itemData = {
        ...currentItem,
        price: parseFloat(currentItem.price)
      };

      if (currentItem.id) {
        await updateMenuItem(currentItem.id, itemData);
      } else {
        await addMenuItem(itemData);
      }

      setIsModalOpen(false);

      // Reset form
      setCurrentItem({
        name: '',
        category: 'Stater',
        quantity: 'Full',
        price: ''
      });

      fetchMenu();

    } catch (err) {
      console.error("Failed to save menu item", err);
    }
  };


  // Edit Item
  const handleEdit = (item) => {
    setCurrentItem({
      ...item,
      price: item.price
    });

    setIsModalOpen(true);
  };


  // Delete Item
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem(id);
        fetchMenu();
      } catch (err) {
        console.error("Failed to delete menu item", err);
      }
    }
  };


  // Search and Category Filter
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === 'All' ||
      item.category === filterCategory;

    return matchesSearch && matchesCategory;
  });


  if (loading) {
    return <div>Loading menu...</div>;
  }


  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

        <h1 className="text-2xl font-bold text-gray-800">
          Menu Management
        </h1>


        <button
          onClick={() => {
            setCurrentItem({
              name: '',
              category: 'Stater',
              quantity: 'Full',
              price: ''
            });

            setIsModalOpen(true);
          }}

          className="cafe-button flex items-center gap-2"
        >
          <FiPlus />
          Add Item
        </button>

      </div>
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">

        <div className="relative flex-1">

          <FiSearch className="absolute left-3 top-3 text-gray-400" />

          <input
            type="text"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />

        </div>


        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >

          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}

        </select>

      </div>



      {/* Menu Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        <table className="min-w-full divide-y divide-gray-200">

          <thead className="bg-gray-50">

            <tr>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>


              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>


              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>


              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>


              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>


              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>

            </tr>

          </thead>



          <tbody className="bg-white divide-y divide-gray-200">

            {filteredItems.map((item) => (

              <tr
                key={item.id}
                className="hover:bg-gray-50 transition-colors"
              >

                {/* Item Name */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.name}
                </td>


                {/* Category */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.category}
                </td>


                {/* Half / Full Quantity */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                  {item.quantity}
                </td>


                {/* Price */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{Number(item.price).toFixed(2)}
                </td>


                {/* Availability */}
                <td className="px-6 py-4 whitespace-nowrap">

                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${item.is_available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}
                  >

                    {item.is_available
                      ? 'Available'
                      : 'Unavailable'}

                  </span>

                </td>


                {/* Action Buttons */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                  <button
                    onClick={() => handleEdit(item)}
                    className="text-primary hover:text-accent mr-3"
                  >
                    <FiEdit2 />
                  </button>


                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 />
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>


        {filteredItems.length === 0 && (

          <div className="p-6 text-center text-gray-500">
            No items found.
          </div>

        )}

      </div>
      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">

            <h2 className="text-xl font-bold mb-4">
              {currentItem.id ? 'Edit Item' : 'Add New Item'}
            </h2>


            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>

                <input
                  type="text"
                  required
                  value={currentItem.name}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      name: e.target.value
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>


              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>

                <select
                  required
                  value={currentItem.category}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      category: e.target.value
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >

                  {categories
                    .filter(cat => cat !== 'All')
                    .map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}

                </select>
              </div>


              {/* Quantity Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>

                <select
                  required
                  value={currentItem.quantity}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      quantity: e.target.value
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="Half">
                    Half
                  </option>

                  <option value="Full">
                    Full
                  </option>

                </select>
              </div>


              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price (₹)
                </label>

                <input
                  type="number"
                  step="0.01"
                  required
                  value={currentItem.price}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      price: e.target.value
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>


              {/* Availability (Edit only) */}
              {currentItem.id && (
                <div className="flex items-center mt-4">

                  <input
                    type="checkbox"
                    id="available"
                    checked={currentItem.is_available !== false}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        is_available: e.target.checked
                      })
                    }
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />

                  <label
                    htmlFor="available"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Available
                  </label>

                </div>
              )}


              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="cafe-button"
                >
                  {currentItem.id
                    ? 'Save Changes'
                    : 'Add Item'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};


export default Menu;