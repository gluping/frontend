import React, { useState, useEffect } from "react";
import {
  createFormInstance,
  fetchFormFields,
  submitFormData,
  submitAmountData,
} from "../api/apiService";
import VehicleDropdown from "./dropDown/VehicleDropdown";

interface FormField {
  name: string;
  field_type: string;
  is_required: boolean;
  filled_by: string;
  order: number;
  id: number;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const CreateCustomerScreen = () => {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [formInstanceId, setFormInstanceId] = useState<number | null>(null);
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formLink, setFormLink] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // New state for amount details
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [vehicleTotalPrice, setVehicleTotalPrice] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [balanceAmount, setBalanceAmount] = useState<number>(0);

  // Restored handleInputChange function
  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prevData) => {
      const updatedData = { ...prevData, [fieldName]: value };
      return updatedData;
    });
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    const fetchFormData = async () => {
      if (formInstanceId) {
        setLoading(true);
        try {
          const fields = await fetchFormFields(formInstanceId);
          setFormFields(fields);
        } catch (err) {
          setError("Failed to fetch form fields");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchFormData();
  }, [formInstanceId]);

  const handleCustomerNameSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const instanceId = await createFormInstance(customerName);
      setFormInstanceId(instanceId);
      localStorage.setItem("form_instance_id", String(instanceId));
      setNameSubmitted(true);
      const generatedLink = `http://localhost:3000/customer/${instanceId}`;
      setFormLink(generatedLink);
    } catch (err: any) {
      setError(err.message || "Failed to create form instance");
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelect = (
    vehicleName: string,
    totalPrice: number,
    vehicleId: number
  ) => {
    setFormData((prevData) => {
      const updatedData = { ...prevData, totalPrice };
      formFields.forEach((field) => {
        if (field.field_type === "vehicle") {
          updatedData[field.name] = vehicleName;
        }
      });
      return updatedData;
    });

    // Store vehicle details
    setVehicleId(vehicleId);
    setVehicleTotalPrice(totalPrice);

    // Update balance amount when vehicle is selected
    const balance = totalPrice - amountPaid;
    setBalanceAmount(balance);

    localStorage.setItem(
      "selected_vehicle",
      JSON.stringify({ vehicleName, totalPrice, vehicleId })
    );
  };

  const handleAmountPaidChange = (amount: number) => {
    setAmountPaid(amount);

    // Recalculate balance amount
    const balance = vehicleTotalPrice - amount;
    setBalanceAmount(balance);
  };

  const handleSubmitAmountDetails = async () => {
    if (!formInstanceId || !vehicleId) {
      setError("Form instance or vehicle not selected");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await submitAmountData(
        formInstanceId,
        vehicleTotalPrice,
        amountPaid,
        balanceAmount,
        vehicleId
      );

      setSuccessMessage("Amount details submitted successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to submit amount details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInstanceId) {
      setError("Form instance ID is missing. Please try again.");
      return;
    }

    const formDataToSubmit: Record<string, any> = {};
    for (const [key, value] of Object.entries(formData)) {
      if (value instanceof File) {
        const base64 = await fileToBase64(value);
        formDataToSubmit[key] = base64;
      } else {
        formDataToSubmit[key] = value;
      }
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const formInstanceIdFromApi = await submitFormData(
        formInstanceId,
        formDataToSubmit
      );
      setSuccessMessage("Form submitted successfully!");
      const generatedLink = `http://localhost:3000/customer/${formInstanceIdFromApi}`;
      setFormLink(generatedLink);
    } catch (err: any) {
      setError(err.message || "Failed to submit the form");
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains the same as in the previous submission...

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Create Customer</h1>
      {!nameSubmitted ? (
        <div>
          <label
            htmlFor="customerName"
            className="block text-gray-700 font-medium"
          >
            Customer Name
          </label>
          <input
            type="text"
            id="customerName"
            className="border p-2 w-full rounded"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
          <button
            onClick={handleCustomerNameSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            Submit Name
          </button>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold mb-2">Customer Form</h2>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium">
              Select Vehicle
            </label>
            <VehicleDropdown token={token} onSelect={handleVehicleSelect} />
          </div>

          {formFields.map((field) => (
            <div key={field.id} className="mb-4">
              <label
                htmlFor={field.name}
                className="block text-gray-700 font-medium"
              >
                {field.name} {field.is_required && "*"}
              </label>
              <input
                type={
                  field.field_type === "vehicle" ? "text" : field.field_type
                }
                id={field.name}
                name={field.name}
                required={field.is_required}
                className="border p-2 w-full rounded"
                value={formData[field.name] || ""}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                disabled={field.filled_by !== "sales_executive"}
              />
            </div>
          ))}

          {/* Amount Details Section */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Payment Details</h3>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium">
                Vehicle Total Price
              </label>
              <input
                type="number"
                value={vehicleTotalPrice}
                readOnly
                className="border p-2 w-full rounded bg-black-200"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium">
                Amount Paid
              </label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => handleAmountPaidChange(Number(e.target.value))}
                className="border p-2 w-full rounded"
                min="0"
                max={vehicleTotalPrice}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium">
                Balance Amount
              </label> 
              <input
                type="number"
                value={balanceAmount}
                readOnly
                className="border p-2 w-full rounded bg-blsck-100"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmitAmountDetails}
              className="bg-green-500 text-white px-4 py-2 rounded mt-4"
              disabled={!vehicleId || amountPaid < 0}
            >
              Submit Amount Details
            </button>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            Submit Form
          </button>

          {successMessage && (
            <div className="text-green-500 mt-4">{successMessage}</div>
          )}
          {error && <div className="text-red-500 mt-4">{error}</div>}
        </form>
      )}
    </div>
  );
};

export default CreateCustomerScreen;
