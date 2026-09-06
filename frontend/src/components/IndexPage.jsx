import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function IndexPage() {

    const [file, setFile] = useState(null);
    const [manualEmails, setManualEmails] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [emailList, setEmailList] = useState([]);

    const [isSending, setIsSending] = useState(false);

    const navigate = useNavigate();


    async function handleSendEmails() {

        if (!subject.trim()) {
            alert("Please enter an email subject.");
            return;
        }

        if (!content.trim()) {
            alert("Please enter email content.");
            return;
        }


        setIsSending(true);


        try {

            let emails = [];


            // --------------------------------
            // 1. Get emails from uploaded file
            // --------------------------------

            if (file) {

                const csvData = await readFile(file);

                const workbook = XLSX.read(csvData, {
                    type: 'binary'
                });

                const sheetName = workbook.SheetNames[0];

                const sheet = workbook.Sheets[sheetName];

                const jsonData = XLSX.utils.sheet_to_json(sheet, {
                    header: "A"
                });

                const fileEmails = jsonData
                    .map(row => row.A)
                    .filter(email => email);

                emails = [...emails, ...fileEmails];
            }


            // --------------------------------
            // 2. Get manually entered emails
            // --------------------------------

            if (manualEmails.trim()) {

                const typedEmails = manualEmails
                    .split(/[\s,]+/)
                    .map(email => email.trim())
                    .filter(email => email);

                emails = [...emails, ...typedEmails];
            }


            // --------------------------------
            // 3. Remove duplicate emails
            // --------------------------------

            emails = [...new Set(emails)];


            // --------------------------------
            // 4. Check recipients
            // --------------------------------

            if (emails.length === 0) {
                alert("Please upload a file or enter at least one email address.");
                return;
            }


            console.log("Final email list:", emails);


            // Store recipient list
            setEmailList(emails);


            // --------------------------------
            // 5. Send emails
            // --------------------------------

            const response = await axios.post(
                "http://localhost:3000/sendEmail",
                {
                    emailList: emails,
                    subject: subject,
                    content: content
                }
            );


            // --------------------------------
            // 6. Success
            // --------------------------------

            alert(response.data);


            // Clear everything
            setFile(null);
            setManualEmails('');
            setSubject('');
            setContent('');
            setEmailList([]);


            // Clear file input
            document.getElementById("fileInput").value = "";


        } catch (error) {

            console.error(error);

            alert("Can't send email.");

        } finally {

            setIsSending(false);

        }
    }


    // Read uploaded file
    function readFile(file) {

        return new Promise((resolve, reject) => {

            const reader = new FileReader();

            reader.onload = (e) => {
                resolve(e.target.result);
            };

            reader.onerror = reject;

            reader.readAsBinaryString(file);

        });
    }


    function handleHistory() {
        navigate("/history");
    }


    return (

        <div className="min-h-screen bg-slate-100">


            {/* Header */}

            <header className="bg-white border-b border-slate-200">

                <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">


                    <div className="flex items-center gap-3">

                        <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center">

                            <span className="text-2xl">
                                ✉️
                            </span>

                        </div>


                        <div>

                            <h1 className="text-xl font-bold text-slate-800">
                                Bulk Mailer
                            </h1>

                            <p className="text-sm text-slate-500">
                                Email Management Dashboard
                            </p>

                        </div>

                    </div>


                    <button
                        onClick={handleHistory}
                        className="px-5 py-2.5 border border-slate-300 
                                   rounded-lg text-slate-700 font-medium
                                   hover:bg-slate-50 transition"
                    >
                        📋 History
                    </button>

                </div>

            </header>


            {/* Main */}

            <main className="max-w-6xl mx-auto px-6 py-10">


                <div className="mb-8">

                    <h2 className="text-3xl font-bold text-slate-800">
                        Send Bulk Emails
                    </h2>

                    <p className="text-slate-500 mt-2">
                        Upload a recipient file or enter email addresses manually.
                    </p>

                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


                    {/* Compose */}

                    <div className="lg:col-span-2 bg-white rounded-2xl
                                    shadow-sm border border-slate-200 p-8">


                        <h3 className="text-xl font-semibold text-slate-800 mb-6">
                            Compose Email
                        </h3>


                        {/* CSV Upload */}

                        <div className="mb-6">

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Upload Recipient List
                            </label>


                            <div className="border-2 border-dashed border-slate-300
                                            rounded-xl p-6 text-center
                                            hover:border-blue-400 transition">

                                <div className="text-3xl mb-2">
                                    📁
                                </div>

                                <p className="text-slate-600 mb-3">
                                    Upload CSV / Excel file
                                </p>


                                <input
                                    id="fileInput"
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    disabled={isSending}
                                    onChange={(e) =>
                                        setFile(e.target.files[0])
                                    }
                                    className="block w-full text-sm text-slate-500
                                               file:mr-4 file:py-2 file:px-4
                                               file:rounded-lg file:border-0
                                               file:bg-blue-50 file:text-blue-700
                                               hover:file:bg-blue-100
                                               disabled:opacity-50"
                                />


                                {file && (

                                    <p className="text-sm text-green-600 mt-3">
                                        ✓ {file.name}
                                    </p>

                                )}

                            </div>

                        </div>


                        {/* OR */}

                        <div className="flex items-center gap-4 mb-6">

                            <div className="flex-1 h-px bg-slate-200"></div>

                            <span className="text-sm text-slate-400">
                                OR
                            </span>

                            <div className="flex-1 h-px bg-slate-200"></div>

                        </div>


                        {/* Manual Emails */}

                        <div className="mb-6">

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Enter Recipient Emails
                            </label>


                            <textarea
                                rows="4"
                                value={manualEmails}
                                disabled={isSending}
                                onChange={(e) =>
                                    setManualEmails(e.target.value)
                                }
                                placeholder={`Enter multiple emails separated by comma or new line

example@gmail.com
hello@gmail.com, test@gmail.com`}
                                className="w-full px-4 py-3 border border-slate-300
                                           rounded-lg outline-none resize-none
                                           focus:ring-2 focus:ring-blue-500
                                           focus:border-blue-500
                                           disabled:bg-slate-100"
                            />


                            <p className="text-xs text-slate-400 mt-2">
                                Separate multiple email addresses using commas,
                                spaces, or new lines.
                            </p>

                        </div>


                        {/* Subject */}

                        <div className="mb-6">

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Subject
                            </label>


                            <input
                                type="text"
                                placeholder="Enter email subject..."
                                value={subject}
                                disabled={isSending}
                                onChange={(e) =>
                                    setSubject(e.target.value)
                                }
                                className="w-full px-4 py-3 border border-slate-300
                                           rounded-lg outline-none
                                           focus:ring-2 focus:ring-blue-500
                                           focus:border-blue-500
                                           disabled:bg-slate-100"
                            />

                        </div>


                        {/* Content */}

                        <div className="mb-6">

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email Body
                            </label>


                            <textarea
                                rows="8"
                                placeholder="Write your email message here..."
                                value={content}
                                disabled={isSending}
                                onChange={(e) =>
                                    setContent(e.target.value)
                                }
                                className="w-full px-4 py-3 border border-slate-300
                                           rounded-lg outline-none resize-none
                                           focus:ring-2 focus:ring-blue-500
                                           focus:border-blue-500
                                           disabled:bg-slate-100"
                            />

                        </div>


                        {/* Send */}

                        <button
                            onClick={handleSendEmails}
                            disabled={isSending}
                            className="w-full bg-blue-600 text-white py-3.5
                                       rounded-lg font-semibold
                                       hover:bg-blue-700
                                       disabled:bg-blue-400
                                       disabled:cursor-not-allowed
                                       active:scale-[0.99]
                                       transition shadow-md"
                        >

                            {isSending
                                ? "⏳ Sending..."
                                : "🚀 Send Emails"
                            }

                        </button>


                        {isSending && (

                            <p className="text-center text-sm text-blue-600 mt-3">
                                Please wait while your emails are being sent...
                            </p>

                        )}

                    </div>


                    {/* Right Side */}

                    <div className="space-y-6">


                        {/* Recipients */}

                        <div className="bg-white rounded-2xl shadow-sm
                                        border border-slate-200 p-6">

                            <p className="text-sm text-slate-500">
                                Recipients
                            </p>


                            <p className="text-3xl font-bold text-slate-800 mt-1">
                                {emailList.length}
                            </p>


                            <p className="text-xs text-slate-400 mt-2">
                                recipients ready to send
                            </p>

                        </div>


                        {/* Instructions */}

                        <div className="bg-blue-600 rounded-2xl p-6 text-white">

                            <h3 className="font-semibold text-lg mb-3">
                                How it works
                            </h3>


                            <div className="space-y-3 text-sm text-blue-100">

                                <p>
                                    1. Upload a CSV/Excel file
                                </p>

                                <p>
                                    2. Or enter emails manually
                                </p>

                                <p>
                                    3. Enter subject and message
                                </p>

                                <p>
                                    4. Click Send Emails
                                </p>

                                <p>
                                    5. Check your History
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default IndexPage;