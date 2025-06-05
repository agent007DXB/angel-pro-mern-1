import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userBankAccounts } from "../redux/slices/appConfigSlice"; // fixed typo
import { axiosClient } from "../utils/axiosClient";
import ClipLoader from "react-spinners/ClipLoader";
import { CiBank } from "react-icons/ci";

const SellForm = () => {
  const user = useSelector((state) => state.appConfigReducer.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [sellAmount, setSellAmount] = useState("");
  const [calculatedINR, setCalculatedINR] = useState(0);
  const [validationMessage, setValidationMessage] = useState("");
  const [bankAccounts, setBankAccounts] = useState(null);

  const { bankAccountNumber, bankHolderName, ifscCode } = selectedAccount;

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const resultAction = await dispatch(userBankAccounts());
        if (userBankAccounts.fulfilled.match(resultAction)) {
          setBankAccounts(resultAction.payload.result);
        }
      } catch (error) {
        console.error("Error fetching bank accounts:", error);
      }
    };

    fetchBankAccounts();
  }, []);

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    setIsAccountModalOpen(false);
  };

  const calculateINR = (usdt) => {
    if (usdt >= 1086.96 && usdt < 2173.92) {
      return usdt * (93 + 0.25);
    } else if (usdt >= 2173.92 && usdt < 3260.87) {
      return usdt * (93 + 0.5);
    } else if (usdt >= 3260.87) {
      return usdt * (93 + 1);
    }
    return usdt * 92;
  };

  useEffect(() => {
    const usdt = Number(sellAmount);
    setCalculatedINR(calculateINR(usdt));
    setValidationMessage(usdt > user?.balance ? "Entered amount is greater than balance" : "");
  }, [sellAmount, user?.balance]);

  const handleSubmit = async () => {
    if (Number(sellAmount) > user?.balance) {
      alert("Entered amount is greater than balance.");
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post("/transaction/sellusdt", {
        bankHolderName,
        bankAccountNumber,
        ifscCode,
        sellUsdtAmount: sellAmount,
        usdtToRupees: calculatedINR.toFixed(2),
        status: "Processing",
      });

      alert("USDT sold successfully.");
      setSellAmount("");
      navigate("/");
    } catch (e) {
      console.error(e);
      alert("Failed to sell USDT.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-gray-100">
      <nav className="w-full bg-white shadow-md p-4 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="text-blue-500 font-bold">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">Sell USDT</h1>
        <button onClick={() => navigate("/payeeHistory")} className="text-blue-500 font-bold">
          Payee History
        </button>
      </nav>

      <div className="w-full max-w-md mx-auto p-6 bg-white shadow-md rounded-md mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Payee Information</h2>
          <button onClick={() => setIsAccountModalOpen(true)} className="text-blue-500 font-bold flex gap-2">
            <svg className="w-4 h-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Select Bank
          </button>
        </div>

        {selectedAccount ? (
          <div className="w-full bg-gradient-to-b mb-4 from-orange-300 to-orange-100 py-2 rounded-xl shadow-xl">
            <div className="flex w-full justify-between items-center">
              <div className="w-full">
                <div className="flex w-full justify-between py-1 px-4">
                  <strong>Payee Name:</strong>
                  <p>{selectedAccount.bankHolderName}</p>
                </div>
                <div className="flex w-full justify-between py-1 px-4">
                  <strong>Account No:</strong>
                  <p>{selectedAccount.bankAccountNumber}</p>
                </div>
                <div className="flex w-full justify-between py-1 px-4">
                  <strong>IFSC:</strong>
                  <p>{selectedAccount.ifscCode}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-red-500 my-4">Please select a bank account.</p>
        )}

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Sell Amount</label>
          <div className="relative">
            <input
              type="number"
              placeholder="Please enter the amount"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              required
              className="w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 font-bold text-gray-500">
              USDT
            </span>
          </div>
          {validationMessage && (
            <span className="text-red-500 text-sm mt-2">{validationMessage}</span>
          )}
          <div className="w-full flex justify-between">
            <p className="text-sm text-gray-500 mt-2">
              <strong>Available: {user?.balance} USDT</strong>
            </p>
            <p className="mt-2 text-sm font-bold text-right">
              ₹{calculatedINR.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-4 px-4 flex justify-center">
          <div className="w-full bg-gradient-to-b from-orange-300 to-orange-100 p-6 rounded-xl shadow-xl">
            <table className="w-full text-center border-collapse bg-white rounded-lg shadow-md overflow-hidden">
              <thead>
                <tr>
                  <th className="border-b-2 border-gray-400 p-4 text-gray-800 bg-gray-200 font-semibold rounded-tl-lg">
                    Exchange ($)
                  </th>
                  <th className="border-b-2 border-l-[1px] border-gray-400 p-4 text-gray-800 bg-gray-200 font-semibold rounded-tr-lg">
                    Price (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border-b border-r border-gray-300 p-4">1075.27 and 2150.54</td>
                  <td className="border-b border-gray-300 p-4">92 <span className="text-red-600">+0.25</span></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border-b border-r border-gray-300 p-4">2150.54 and 3225.81</td>
                  <td className="border-b border-gray-300 p-4">92 <span className="text-red-600">+0.50</span></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border-b border-r border-gray-300 p-4">3225.81+</td>
                  <td className="border-b border-gray-300 p-4">92 <span className="text-red-600">+1.00</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 transition duration-200"
          >
            {loading ? <ClipLoader color="#fff" size={20} /> : "Confirm Sell"}
          </button>
        </div>
      </div>

      {isAccountModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Select Bank Account</h2>
            <div className="mb-4">
              {bankAccounts?.length === 0 ? (
                <div className="flex justify-center">
                  <button
                    onClick={() => navigate("/addbank")}
                    className="flex flex-col items-center p-4 border-2 border-gray-950 bg-orange-200 text-gray-700 hover:text-blue-500"
                  >
                    <CiBank className="w-6 h-6" />
                    <span className="mt-2 text-sm font-bold">Add Bank</span>
                  </button>
                </div>
              ) : (
                bankAccounts?.map((account, index) => (
                  <button
                    key={index}
                    onClick={() => handleAccountSelect(account)}
                    className="w-full bg-gradient-to-b mb-4 from-orange-300 hover:bg-gray-100 to-orange-100 p-2 rounded-md shadow-xl"
                  >
                    <div className="flex w-full justify-between">
                      <strong>Payee Name:</strong> <p>{account.bankHolderName}</p>
                    </div>
                    <div className="flex w-full justify-between">
                      <strong>Account No:</strong> <p>{account.bankAccountNumber}</p>
                    </div>
                    <div className="flex w-full justify-between">
                      <strong>IFSC:</strong> <p>{account.ifscCode}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setIsAccountModalOpen(false)}
              className="w-full py-2 px-4 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellForm;
