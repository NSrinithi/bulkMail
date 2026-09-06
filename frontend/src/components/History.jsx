import React, { useEffect, useState } from 'react';
import axios from 'axios';

function History() {

    const [history, setHistory] = useState([]);

    // Fetch email history
    useEffect(() => {

        async function fetchHistory() {

            try {

                const response = await axios.get(
                    "http://localhost:3000/emailHistory"
                );

                setHistory(response.data);

            } catch (error) {

                console.error(error);
                alert("Can't fetch email history");

            }
        }

        fetchHistory();

    }, []);


    // Delete history
    const deleteHistory = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this email history?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            await axios.delete(
                `http://localhost:3000/deleteHistory/${id}`
            );

            // Remove deleted item from UI
            setHistory(
                history.filter(item => item._id !== id)
            );

        } catch (error) {

            console.error(error);
            alert("Failed to delete history");

        }
    };


    return (

        <div className="min-h-screen bg-slate-100 p-8">

            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-slate-800">
                        Email History
                    </h1>

                    <p className="text-slate-500 mt-2">
                        View your previously sent bulk emails
                    </p>

                </div>


                {/* No History */}
                {history.length === 0 ? (

                    <div className="bg-white rounded-2xl p-8 text-center shadow-sm">

                        <p className="text-slate-500">
                            No email history found.
                        </p>

                    </div>

                ) : (

                    /* History List */
                    <div className="space-y-4">

                        {history.map((item) => (

                            <div
                                key={item._id}
                                className="bg-white rounded-2xl p-6 
                                           shadow-sm border border-slate-200"
                            >

                                {/* Top Section */}
                                <div className="flex justify-between items-start gap-4">

                                    {/* Subject + Recipients */}
                                    <div className="flex-1">

                                        <h2 className="text-xl font-semibold text-slate-800">
                                            {item.subject}
                                        </h2>


                                        <p className="text-sm text-slate-500 mt-1">
                                            {item.emails.length} recipients
                                        </p>


                                        {/* Recipients */}
                                        <div className="mt-3 flex flex-wrap gap-2">

                                            {item.emails.map((email, index) => (

                                                <span
                                                    key={index}
                                                    className="bg-slate-100 text-slate-700 
                                                               px-3 py-1 rounded-full 
                                                               text-sm"
                                                >
                                                    {email}
                                                </span>

                                            ))}

                                        </div>

                                    </div>


                                    {/* Status + Delete */}
                                    <div className="flex items-center gap-3">

                                        {/* Status */}
                                        <span
                                            className="bg-green-100 text-green-700 
                                                       px-3 py-1 rounded-full 
                                                       text-sm"
                                        >
                                            {item.status}
                                        </span>


                                        {/* Delete Button */}
                                        <button
                                            onClick={() => deleteHistory(item._id)}
                                            className="bg-red-100 text-red-600 
                                                       px-3 py-1 rounded-lg 
                                                       text-sm font-medium
                                                       hover:bg-red-200
                                                       transition"
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>


                                {/* Email Content */}
                                <div className="mt-5">

                                    <p className="text-slate-600 whitespace-pre-wrap">
                                        {item.content}
                                    </p>

                                </div>


                                {/* Sent Date */}
                                <div className="mt-5 pt-4 border-t border-slate-100">

                                    <p className="text-sm text-slate-400">

                                        Sent on:{" "}

                                        {new Date(item.sentAt).toLocaleString()}

                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>

    );
}

export default History;