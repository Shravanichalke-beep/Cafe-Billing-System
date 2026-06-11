import { useState, useEffect } from 'react';
import { FiPrinter, FiBluetooth, FiCheckCircle } from 'react-icons/fi';

const Settings = () => {
    const [printerDevice, setPrinterDevice] = useState(null);
    const [printerStatus, setPrinterStatus] = useState('Disconnected');
    const [receiptWidth, setReceiptWidth] = useState('58mm');

    // Load saved printer settings (in a real app, you might save the device ID if possible, but Web Bluetooth requires user gesture each time to connect)
    useEffect(() => {
        const savedWidth = localStorage.getItem('receiptWidth');
        if (savedWidth) setReceiptWidth(savedWidth);
    }, []);

    const handleWidthChange = (e) => {
        setReceiptWidth(e.target.value);
        localStorage.setItem('receiptWidth', e.target.value);
    };

    const connectBluetoothPrinter = async () => {
        try {
            setPrinterStatus('Connecting...');
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }], // Typical generic printer service UUID
                optionalServices: ['e7810a71-73ae-499d-8c15-faa9aef0c3f2'] // Another common one
            });

            device.addEventListener('gattserverdisconnected', () => {
                setPrinterStatus('Disconnected');
                setPrinterDevice(null);
            });

            await device.gatt.connect();
            setPrinterDevice(device);
            setPrinterStatus('Connected');
            alert(`Connected to ${device.name}`);
        } catch (err) {
            console.error("Bluetooth connection failed", err);
            setPrinterStatus('Disconnected');
            alert("Failed to connect to printer. Ensure Bluetooth is enabled and the device is nearby.");
        }
    };

    const testPrint = async () => {
        if (!printerDevice || !printerDevice.gatt.connected) {
            alert("Printer not connected!");
            return;
        }

        try {
            setPrinterStatus('Printing...');
            // Simplified ESC/POS test command
            const server = await printerDevice.gatt.connect();
            // The exact service and characteristic UUIDs depend on the printer model.
            // This is a common pattern for cheap thermal printers.
            const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
            const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

            const encoder = new TextEncoder();
            const text = encoder.encode("--- Kalakarz Town ---\nTest Print Successful\n\n\n\n");
            await characteristic.writeValue(text);
            setPrinterStatus('Connected');
        } catch (err) {
            console.error("Print failed", err);
            setPrinterStatus('Connected'); // Reset status
            alert("Test print failed. The printer might use different GATT services.");
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FiPrinter /> Printer Configuration
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Width</label>
                            <select value={receiptWidth} onChange={handleWidthChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary">
                                <option value="58mm">58mm (Standard Thermal)</option>
                                <option value="80mm">80mm (Wide Thermal)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">This affects how the receipt preview and physical print is formatted.</p>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-700 mb-2">Web Bluetooth Support</p>
                            <p className="text-sm text-gray-600 mb-4">
                                To print directly to a Bluetooth thermal printer, your browser must support the Web Bluetooth API (Chrome/Edge on Android, Mac, ChromeOS, Windows).
                            </p>
                            {navigator.bluetooth ? (
                                <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 p-2 rounded">
                                    <FiCheckCircle /> Web Bluetooth is supported by your browser.
                                </div>
                            ) : (
                                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                                    Web Bluetooth is not supported in this browser. Please use Chrome or Edge.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col justify-center items-center text-center space-y-4">
                        <div className={`p-4 rounded-full ${printerStatus === 'Connected' ? 'bg-green-100 text-green-600' : printerStatus === 'Printing...' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                            <FiBluetooth size={32} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">{printerDevice ? printerDevice.name : 'No Printer Paired'}</p>
                            <p className={`text-sm ${printerStatus === 'Connected' ? 'text-green-600 font-medium' : 'text-gray-500'}`}>Status: {printerStatus}</p>
                        </div>

                        <div className="flex gap-2 mt-4 w-full">
                            {printerStatus !== 'Connected' && printerStatus !== 'Printing...' ? (
                                <button onClick={connectBluetoothPrinter} disabled={!navigator.bluetooth} className="flex-1 bg-primary text-white py-2 rounded font-medium hover:bg-accent transition-colors disabled:opacity-50">
                                    Pair Printer
                                </button>
                            ) : (
                                <>
                                    <button onClick={testPrint} className="flex-1 bg-white border border-primary text-primary py-2 rounded font-medium hover:bg-gray-50 transition-colors">
                                        Test Print
                                    </button>
                                    <button onClick={() => { if (printerDevice) printerDevice.gatt.disconnect() }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-medium hover:bg-gray-300 transition-colors">
                                        Disconnect
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
