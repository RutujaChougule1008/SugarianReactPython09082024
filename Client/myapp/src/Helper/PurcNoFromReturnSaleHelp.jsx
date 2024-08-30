import React, { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import DataTableSearch from "../Common/HelpCommon/DataTableSearch";
import DataTablePagination from "../Common/HelpCommon/DataTablePagination";
import axios from "axios";
import "../App.css";

var lActiveInputFeild = "";
const CompanyCode = sessionStorage.getItem("Company_Code");
const API_URL = process.env.REACT_APP_API;
const Year_Code = sessionStorage.getItem("Year_Code");

const PurcNoFromReturnSaleHelp = ({
    onAcCodeClick,
    name,
    purchaseNo,
    OnSaleBillHead,
    OnSaleBillDetail,
    disabledFeild,
    tabIndexHelp,
    Type,
    sugarSaleReturnSale 
}) => {
    const [showModal, setShowModal] = useState(false);
    const [popupContent, setPopupContent] = useState([]);
    const [enteredAcCode, setEnteredAcCode] = useState("");
    const [type, setType] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
    const [apiDataFetched, setApiDataFetched] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [totalQuintal, setTotalQuintal] = useState(0);
    const [totalBillAmount, setTotalBillAmount] = useState(0);
    const [selectedItemCodes, setSelectedItemCodes] = useState([]);
    const [selectedItemNames, setSelectedItemNames] = useState([]);


    // Fetch data based on acType
    const fetchAndOpenPopup = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/sugarian/PurcNoFromReturnSale?Company_Code=${CompanyCode}`);
            const data = response.data;
            const filteredData = data.filter(item => {
                const partyName = item.PartyName ? item.PartyName.toLowerCase() : "";
                const millName = item.MillName ? item.MillName.toLowerCase() : "";

                return partyName.includes(searchTerm.toLowerCase()) ||
                    millName.includes(searchTerm.toLowerCase());
            });
            setPopupContent(filteredData);
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        console.log("Received purchaseNo:", purchaseNo);
        console.log("Received type:", Type);
        setEnteredAcCode(purchaseNo);
        setType(Type);
    }, [purchaseNo, Type]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchAndOpenPopup();
                setShowModal(false);
                setApiDataFetched(true);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (!apiDataFetched) {
            fetchData();
        }

    }, [apiDataFetched]);

    // Handle Mill Code button click
    const handleMillCodeButtonClick = () => {
        lActiveInputFeild = name;
        fetchAndOpenPopup();
        if (onAcCodeClick) {
            onAcCodeClick({ enteredAcCode });
        }
    };

    //popup functionality show and hide
    const handleCloseModal = () => {
        setShowModal(false);
    };

    //handle onChange event for Mill Code,Broker Code and Bp Account
    const handleAcCodeChange = async (event) => {
        const { value } = event.target;
        setEnteredAcCode(value);

        try {
            const response = await axios.get(`http://localhost:8080/api/sugarian/PurcNoFromReturnSale?Company_Code=${CompanyCode}`);
            const data = response.data;
            setPopupContent(data);
            setApiDataFetched(true);

            const matchingItem = data.find((item) => item.doc_no === parseInt(value, 10));

            if (matchingItem) {
                setEnteredAcCode(matchingItem.doc_no);
                // setType(matchingItem.Tran_Type);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleCheckboxChange = (item, index, checked) => {
        const updatedItem = { ...item, isSelected: checked };
    
        const updatedContent = [
            ...popupContent.slice(0, index),
            updatedItem,
            ...popupContent.slice(index + 1),
        ];
        setPopupContent(updatedContent);
    
        if (checked) {
            setSelectedItems((prevSelected) => [...prevSelected, updatedItem]);
            setTotalQuintal((prevTotal) => prevTotal + parseFloat(updatedItem.Quantal));
            setTotalBillAmount((prevTotal) => prevTotal + parseFloat(updatedItem.Bill_Amount));
            // setSelectedItemCodes((prevCodes) => [...prevCodes, updatedItem.doc_no]);
            // setSelectedItemNames((prevNames) => [...prevNames, updatedItem.MillName]);
        } else {
            setSelectedItems((prevSelected) => prevSelected.filter((i) => i.doc_no !== updatedItem.doc_no));
            setTotalQuintal((prevTotal) => prevTotal - parseFloat(updatedItem.Quantal));
            setTotalBillAmount((prevTotal) => prevTotal - parseFloat(updatedItem.Bill_Amount));
            // setSelectedItemCodes((prevCodes) => prevCodes.filter((code) => code !== updatedItem.doc_no));
            // setSelectedItemNames((prevNames) => prevNames.filter((name) => name !== updatedItem.MillName));
        }
    };
    

    const fetchSaleBillData = async (purchaNo) => {
        try {
            const response = await axios.get(`${API_URL}/get-sugarpurchasereturn-by-id?doc_no=${purchaNo}&Company_Code=${CompanyCode}&Year_Code=${Year_Code}`);
            const saleBillHead = response.data.last_head_data;
            const saleBillDetail = response.data.last_details_data[0];
            OnSaleBillHead(saleBillHead);
            OnSaleBillDetail(saleBillDetail);
        } catch (error) {
            console.error("Error fetching SaleBill data:", error);
        }
    };

    const handleSelectClick = () => {
        if (sugarSaleReturnSale) {
            sugarSaleReturnSale(totalBillAmount, totalQuintal, selectedItems);
        }
        // Close modal after selection
        setShowModal(false);
    };

    //After open popup onDoubleClick event that record display on the fields
    const handleRecordDoubleClick = (item) => {
        if (lActiveInputFeild === name) {
            setEnteredAcCode(item.PURCNO);
            // setType(item.Tran_Type);

            fetchSaleBillData(item.doc_no);

            if (onAcCodeClick) {
                onAcCodeClick(item.doc_no);
            }
        }

        setShowModal(false);
    };

    //handle pagination number
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    //handle search functionality
    const handleSearch = (searchValue) => {
        setSearchTerm(searchValue);
    };

    const filteredData = popupContent.filter((item) =>
        item.PartyName && item.PartyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToDisplay = filteredData.slice(startIndex, endIndex);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "F1") {
                if (event.target.id === name) {
                    lActiveInputFeild = name;
                    setSearchTerm(event.target.value);
                    fetchAndOpenPopup();
                    event.preventDefault();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [name, fetchAndOpenPopup]);

    useEffect(() => {
        const handleKeyNavigation = (event) => {
            if (showModal) {
                if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setSelectedRowIndex((prev) => Math.max(prev - 1, 0));
                } else if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setSelectedRowIndex((prev) => Math.min(prev + 1, itemsToDisplay.length - 1));
                } else if (event.key === "Enter") {
                    event.preventDefault();
                    if (selectedRowIndex >= 0) {
                        handleRecordDoubleClick(itemsToDisplay[selectedRowIndex]);
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyNavigation);

        return () => {
            window.removeEventListener("keydown", handleKeyNavigation);
        };
    }, [showModal, selectedRowIndex, itemsToDisplay, handleRecordDoubleClick]);

    return (
        <div className="d-flex flex-row ">
            <div className="d-flex ">
                <div className="d-flex">
                    <input
                        type="text"
                        className="form-control ms-2"
                        id={name}
                        autoComplete="off"
                        value={enteredAcCode !== '' ? enteredAcCode : purchaseNo}
                        onChange={handleAcCodeChange}
                        style={{ width: "150px", height: "35px" }}
                        disabled={disabledFeild}
                        tabIndex={tabIndexHelp}
                    />
                    <Button
                        variant="primary"
                        onClick={handleMillCodeButtonClick}
                        className="ms-1"
                        style={{ width: "30px", height: "35px" }}
                        disabled={disabledFeild}
                        tabIndex={tabIndexHelp}
                    >
                        ...
                    </Button>
                    <label id="name" className="form-labels ms-2">
                        {type !== '' ? type : Type}
                    </label>
                </div>
            </div>
            <Modal
                show={showModal}
                onHide={handleCloseModal}
                dialogClassName="modal-dialog"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Popup</Modal.Title>
                </Modal.Header>
                <DataTableSearch data={popupContent} onSearch={handleSearch} />
                <Modal.Body>
                    {Array.isArray(popupContent) ? (
                        <div className="table-responsive">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    const updatedContent = itemsToDisplay.map(item => ({
                                                        ...item,
                                                        isSelected: checked,
                                                    }));
                                                    setPopupContent(updatedContent);
                                                }}
                                            />
                                        </th>
                                        <th>Doc_no</th>
                                        <th>Date</th>
                                        <th>Tran Type</th>
                                        <th>Mill Name</th>
                                        <th>Quintal</th>
                                        <th>Party Name</th>
                                        <th>Bill Amount</th>
                                        <th>Year Code</th>
                                        <th>Purchase Id</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemsToDisplay.map((item, index) => (
                                        <tr
                                            key={index}
                                            className={
                                                selectedRowIndex === index ? "selected-row" : ""
                                            }
                                            onDoubleClick={() => handleRecordDoubleClick(item)}
                                        >
                                            <td>
                <input
                    type="checkbox"
                    checked={item.isSelected || false}
                    onChange={(e) => handleCheckboxChange(item, index, e.target.checked)}
                />
            </td>
                                            <td>{item.doc_no}</td>
                                            <td>{item.doc_date}</td>
                                            <td>{item.Tran_Type}</td>
                                            <td>{item.MillName}</td>
                                            <td>{item.Quantal}</td>
                                            <td>{item.PartyName}</td>
                                            <td>{item.Bill_Amount}</td>
                                            <td>{item.Year_Code}</td>
                                            <td>{item.prid}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        "Loading..."
                    )}
                </Modal.Body>

                <Modal.Footer>
                <div>
        <p>Total Quintal: {totalQuintal}</p>
        <p>Total Bill Amount: {totalBillAmount}</p>
    </div>
    <Button variant="primary" onClick={handleSelectClick}>
                    Select
                </Button>
                    <DataTablePagination
                        totalItems={filteredData.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                    />
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PurcNoFromReturnSaleHelp;
