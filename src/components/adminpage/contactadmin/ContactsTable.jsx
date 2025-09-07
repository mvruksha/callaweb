"use client";

import { useState, useEffect, useMemo } from "react";
import { format, parseISO } from "date-fns";

// --- SVG ICONS ---
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

// --- PAGINATION COMPONENT ---
const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center items-center space-x-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-xs bg-white border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-3 py-1 rounded-xs text-sm font-medium border ${
            currentPage === number
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
          }`}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-xs bg-white border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </nav>
  );
};

// --- MAIN CONTACTS TABLE COMPONENT ---
const ContactsTable = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const CONTACTS_PER_PAGE = 20;
  const API_ENDPOINT = "https://callabackend.vercel.app/api/contacts";

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) throw new Error("Network response was not ok.");

        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const sortedData = result.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setContacts(sortedData);
        } else {
          throw new Error("API did not return the expected data structure.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const handleDelete = async (contactId) => {
    // In a real app, use a custom modal instead of window.confirm
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        const response = await fetch(`${API_ENDPOINT}/${contactId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete contact.");
        }

        // Update state immediately for a responsive UI
        setContacts((prevContacts) =>
          prevContacts.filter((c) => c._id !== contactId)
        );
      } catch (err) {
        alert(`Error: ${err.message}`); // Use a toast notification in a real app
      }
    }
  };

  const filteredContacts = useMemo(() => {
    if (!searchTerm) return contacts;

    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.number.includes(searchTerm)
    );
  }, [contacts, searchTerm]);

  // Pagination logic
  const indexOfLastContact = currentPage * CONTACTS_PER_PAGE;
  const indexOfFirstContact = indexOfLastContact - CONTACTS_PER_PAGE;
  const currentContacts = filteredContacts.slice(
    indexOfFirstContact,
    indexOfLastContact
  );

  if (loading)
    return <div className="text-center p-12">Loading contacts...</div>;
  if (error)
    return <div className="text-center p-12 text-red-600">Error: {error}</div>;

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="max-w-8xl mx-auto">
        <div className="bg-white p-6 rounded-xs shadow-md border border-gray-200">
          {/* Header: Title and Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
              Contact Submissions
            </h2>
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by name, email, or number..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on search
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Phone Number
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Service Interest
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Submitted On
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentContacts.length > 0 ? (
                  currentContacts.map((contact) => (
                    <tr
                      key={contact._id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {contact.name}
                      </td>
                      <td className="px-6 py-4">{contact.email}</td>
                      <td className="px-6 py-4">{contact.number}</td>
                      <td className="px-6 py-4">{contact.services}</td>
                      <td className="px-6 py-4">
                        {format(
                          parseISO(contact.createdAt),
                          "dd MMM, yyyy 'at' hh:mm a"
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(contact._id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full transition-colors duration-200"
                          aria-label="Delete contact"
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-500">
                      No contacts found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredContacts.length > CONTACTS_PER_PAGE && (
            <Pagination
              totalItems={filteredContacts.length}
              itemsPerPage={CONTACTS_PER_PAGE}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactsTable;
