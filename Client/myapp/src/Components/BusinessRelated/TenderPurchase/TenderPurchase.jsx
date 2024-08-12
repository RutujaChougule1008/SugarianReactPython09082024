import React from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ActionButtonGroup from "../../../Common/CommonButtons/ActionButtonGroup";
import NavigationButtons from "../../../Common/CommonButtons/NavigationButtons";
import "./TenderPurchase.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AccountMasterHelp from "../../../Helper/AccountMasterHelp";
import { z } from "zod";
import GSTRateMasterHelp from "../../../Helper/GSTRateMasterHelp";

const companyCode = sessionStorage.getItem("Company_Code");
const Year_Code = sessionStorage.getItem("Year_Code");
const API_URL = process.env.REACT_APP_API;

console.log("Company",companyCode)

// Validation Part Using Zod Library
const stringToNumber = z
  .string()
  .refine((value) => !isNaN(Number(value)), {
    message: "This field must be a number",
  })
  .transform((value) => Number(value));

// Validation Schemas
const SugarTenderPurchaseSchema = z.object({
  doc_no: z.string().optional(),
  PURCNO: z.number().int().nonnegative(),
  PurcTranType: z.string().optional(),
  Tran_Type: z.string().default("PR"),
  doc_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"), // Date in YYYY-MM-DD
  Ac_Code: z.number().int().nonnegative(),
  Unit_Code: z.number().int().nonnegative(),
  mill_code: z.number().int().nonnegative(),
  FROM_STATION: z.string().optional(),
  TO_STATION: z.string().optional(),
  LORRYNO: z.string().optional(),
  BROKER: z.number().int().nonnegative(),
  wearhouse: z.string().optional(),
  subTotal: z.number().nonnegative(),
  LESS_FRT_RATE: z.number().nonnegative(),
  freight: z.number().nonnegative(),
  cash_advance: z.number().nonnegative(),
  bank_commission: z.number().nonnegative(),
  OTHER_AMT: z.number().nonnegative(),
  Bill_Amount: z.number().nonnegative(),
  Due_Days: z.number().int().nonnegative(),
  NETQNTL: z.number().nonnegative(),
  Company_Code: z.string().optional(),
  Year_Code: z.string().optional(),
  Branch_Code: z.number().int().nonnegative(),
  Created_By: z.string().optional(),
  Modified_By: z.string().optional(),
  Bill_No: z.string().optional(),
  CGSTRate: z.number().nonnegative(),
  CGSTAmount: z.number().nonnegative(),
  SGSTRate: z.number().nonnegative(),
  SGSTAmount: z.number().nonnegative(),
  IGSTRate: z.number().nonnegative(),
  IGSTAmount: z.number().nonnegative(),
  GstRateCode: z.number().int().nonnegative(),
  purcyearcode: z.string().optional(),
  Bill_To: z.number().int().nonnegative(),
  srid: z.number().int().nonnegative(),
  ac: z.number().int().nonnegative(),
  uc: z.number().int().nonnegative(),
  mc: z.number().int().nonnegative(),
  bc: z.number().int().nonnegative(),
  bt: z.number().int().nonnegative(),
  sbid: z.number().int().nonnegative(),
  TCS_Rate: z.number().nonnegative(),
  TCS_Amt: z.number().nonnegative(),
  TCS_Net_Payable: z.number().nonnegative(),
  einvoiceno: z.string().optional(),
  ackno: z.string().optional(),
  TDS_Rate: z.number().nonnegative(),
  TDS_Amt: z.number().nonnegative(),
  QRCode: z.string().optional(),
  gstid: z.number().int().nonnegative(),
});

var millCodeName;
var newMill_Code;
var gradeName;
var newGrade;
var paymentToName;
var newPayment_To;
var tenderFromName;
var newTender_From;
var tenderDOName;
var newTender_DO;
var voucherByName;
var newVoucher_By;
var brokerName;
var newBroker;
var itemName;
var newitemcode;
var gstRateName;
var gstRateCode;
var newgstratecode;
var bpAcName;
var newBp_Account;
var billToName;
var newBillToCode;
var shipToName;
var shipToCode;
var subBrokerName;
var subBrokerCode;
var newTenderId;
const TenderPurchase = () => {
  const [updateButtonClicked, setUpdateButtonClicked] = useState(false);
  const [saveButtonClicked, setSaveButtonClicked] = useState(false);
  const [addOneButtonEnabled, setAddOneButtonEnabled] = useState(false);
  const [saveButtonEnabled, setSaveButtonEnabled] = useState(true);
  const [cancelButtonEnabled, setCancelButtonEnabled] = useState(true);
  const [editButtonEnabled, setEditButtonEnabled] = useState(false);
  const [deleteButtonEnabled, setDeleteButtonEnabled] = useState(false);
  const [backButtonEnabled, setBackButtonEnabled] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [highlightedButton, setHighlightedButton] = useState(null);
  const [cancelButtonClicked, setCancelButtonClicked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [accountCode, setAccountCode] = useState("");
  const [millCode, setMillCode] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [grade, setGrade] = useState("");
  const [bpAcCode, setBpAcCode] = useState("");
  const [paymentTo, setPaymentTo] = useState("");
  const [tenderFrom, setTenderFrom] = useState("");
  const [tenderDO, setTenderDO] = useState("");
  const [voucherBy, setVoucherBy] = useState("");
  const [broker, setBroker] = useState("");
  const [GstRate, setGSTRate] = useState("");
  const [lastTenderDetails, setLastTenderDetails] = useState([]);
  const [lastTenderData, setLastTenderData] = useState({});
  const [gstCode, setGstCode] = useState("");
  const [billtoName, setBillToName] = useState("");
  const [brokerDetail, setBrokerDetail] = useState("");
  const [shiptoName, setShipToName] = useState("");

  const navigate = useNavigate();
  //In utility page record doubleClicked that recod show for edit functionality
  const location = useLocation();
  const selectedRecord = location.state?.selectedRecord;
  const initialFormData = {
    Tender_No: "",
    Company_Code: companyCode,
    Tender_Date: new Date().toISOString().split("T")[0],
    Lifting_Date: new Date().toISOString().split("T")[0],
    Mill_Code: "",
    Grade: "",
    Quantal: "",
    Packing: 50,
    Bags: "",
    Payment_To: "",
    Tender_From: "",
    Tender_DO: "",
    Voucher_By: "",
    Broker: "",
    Excise_Rate: "",
    Narration: "",
    Mill_Rate: "",
    Created_By: "",
    Modified_By: "",
    Year_Code: Year_Code,
    Purc_Rate: "",
    type: "",
    Branch_Id: "",
    Voucher_No: "",
    Sell_Note_No: "",
    Brokrage: "",
    mc: "",
    itemcode: "",
    season: "",
    pt: "",
    tf: "",
    td: "",
    vb: "",
    bk: "",
    ic: "",
    gstratecode: "",
    CashDiff: "",
    TCS_Rate: "",
    TCS_Amt: "",
    commissionid: "",
    Voucher_Type: "",
    Party_Bill_Rate: "",
    TDS_Rate: "",
    TDS_Amt: "",
    Temptender: "",
    AutoPurchaseBill: "",
    Bp_Account: "",
    bp: "",
    groupTenderNo: "",
    groupTenderId: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const setFocusTaskdate = useRef(null);
  const [isHandleChange, setIsHandleChange] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //Deatil
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState({});
  const [deleteMode, setDeleteMode] = useState(false);
  const [billTo, setBillTo] = useState("");
  const [shipTo, setShipTo] = useState("");
  const [detailBroker, setDetailBroker] = useState("");
  const [subBroker, setSubBroker] = useState("");
  const [billToAccoid, setBillToAccoid] = useState("");
  const [shipToAccoid, setShipToAccoid] = useState("");
  const [subBrokerAccoid, setSubBrokerAccoid] = useState("");
  const [formDataDetail, setFormDataDetail] = useState({
    Buyer_Quantal: "",
    Sale_Rate: "",
    Commission_Rate: "",
    Sauda_Date: new Date().toISOString().split("T")[0],
    Lifting_Date: new Date().toISOString().split("T")[0],
    Narration: "",
    tcs_rate: "",
    gst_rate: "",
    tcs_amt: "",
    gst_amt: "",
    CashDiff: "",
    BP_Detail: "",
    loding_by_us: "",
    DetailBrokrage: "",
    Delivery_Type: "",
  });

  const [calculatedValues, setCalculatedValues] = useState({
    bags: "",
    diff: "",
    exciseRate: "",
    gstAmt: "",
    amount: "",
    lblValue: "",
    tcsAmt: "",
  });

  useEffect(() => {
    const calculateValues = () => {
      const {
        Quantal,
        Packing,
        Mill_Rate,
        Purc_Rate,
        Excise_Rate,
        type,
        TCS_Rate,
      } = formData;

      const quantal = parseFloat(Quantal) || 0;
      const packing = parseFloat(Packing) || 50 || 0;
      const millRate = parseFloat(Mill_Rate) || 0;
      const purchaseRate = parseFloat(Purc_Rate) || 0;
      const exciseRate = parseFloat(Excise_Rate) || 0;
      const gstRateCode = parseFloat(gstCode) || 0;
      const tcsRate = parseFloat(TCS_Rate) || 0;

      // Calculations
      const bags = (quantal / packing) * 100;
      const diff = millRate - purchaseRate;
      const exciseAmount = (millRate * gstRateCode) / 100;
      const gstAmt = exciseAmount + millRate;
      const amount = type === "M" ? quantal * millRate : quantal * diff;
      const lblValue = quantal * (millRate + exciseAmount);
      const tcsAmt = lblValue * tcsRate;

      // Update state with calculated values
      setCalculatedValues({
        bags,
        diff,
        exciseRate: exciseAmount,
        gstAmt,
        amount,
        lblValue,
        tcsAmt,
      });
    };

    calculateValues();
  }, [formData]);

//   const calculateDependentValues = async (
//     name,
//     input,
//     formData,
//     matchStatus,
//     gstRate
//   ) => {
//     // Clone the formData and update the specific field
//     const updatedFormData = { ...formData, [name]: input };

//     // Parsing and handling potential NaN values by defaulting to 0
//     const subtotal = parseFloat(updatedFormData.subTotal) || 0.0;
//     const rate = parseFloat(gstRate) || 0.0;
//     const netQntl = parseFloat(updatedFormData.NETQNTL) || 0.0;
//     const freightRate = parseFloat(updatedFormData.LESS_FRT_RATE) || 0.0;
//     const miscAmount = parseFloat(updatedFormData.OTHER_AMT) || 0.0;
//     const cashAdvance = parseFloat(updatedFormData.cash_advance) || 0.0;
//     const bankCommission = parseFloat(updatedFormData.bank_commission) || 0.0;
//     const tcsRate = parseFloat(updatedFormData.TCS_Rate) || 0.0;
//     const tdsRate = parseFloat(updatedFormData.TDS_Rate) || 0.0;

//     // Calculating freight
//     updatedFormData.freight = (netQntl * freightRate).toFixed(2);

//     // Setting GST rates and amounts based on matchStatus
//     if (matchStatus === "TRUE") {
//       updatedFormData.CGSTRate = (rate / 2).toFixed(2);
//       updatedFormData.SGSTRate = (rate / 2).toFixed(2);
//       updatedFormData.IGSTRate = 0.0;

//       updatedFormData.CGSTAmount = (
//         (subtotal * parseFloat(updatedFormData.CGSTRate)) /
//         100
//       ).toFixed(2);
//       updatedFormData.SGSTAmount = (
//         (subtotal * parseFloat(updatedFormData.SGSTRate)) /
//         100
//       ).toFixed(2);
//       updatedFormData.IGSTAmount = 0.0;
//     } else {
//       updatedFormData.IGSTRate = rate.toFixed(2);
//       updatedFormData.CGSTRate = 0.0;
//       updatedFormData.SGSTRate = 0.0;

//       updatedFormData.IGSTAmount = (
//         (subtotal * parseFloat(updatedFormData.IGSTRate)) /
//         100
//       ).toFixed(2);
//       updatedFormData.CGSTAmount = 0.0;
//       updatedFormData.SGSTAmount = 0.0;
//     }

//     // Calculating the Bill Amount
//     updatedFormData.Bill_Amount = (
//       subtotal +
//       parseFloat(updatedFormData.CGSTAmount) +
//       parseFloat(updatedFormData.SGSTAmount) +
//       parseFloat(updatedFormData.IGSTAmount) +
//       miscAmount +
//       parseFloat(updatedFormData.freight) +
//       bankCommission +
//       cashAdvance
//     ).toFixed(2);

//     // Calculating TCS and Net Payable
//     updatedFormData.TCS_Amt = (
//       (parseFloat(updatedFormData.Bill_Amount) * tcsRate) /
//       100
//     ).toFixed(2);

//     updatedFormData.TCS_Net_Payable = (
//       parseFloat(updatedFormData.Bill_Amount) +
//       parseFloat(updatedFormData.TCS_Amt)
//     ).toFixed(2);

//     // Calculating TDS
//     updatedFormData.TDS_Amt = ((subtotal * tdsRate) / 100).toFixed(2);

//     return updatedFormData;
//   };

  const calculateNetQuantal = (users) => {
    return users
      .filter((user) => user.rowaction !== "delete" && user.rowaction !== "DNU")
      .reduce((sum, user) => sum + parseFloat(user.Quantal || 0), 0);
  };

  const calculateDetails = (quantal, packing, rate) => {
    const bags = packing !== 0 ? (quantal / packing) * 100 : 0;
    const item_Amount = quantal * rate;
    return { bags, item_Amount };
  };

  const checkMatchStatus = async (ac_code, company_code, year_code) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API}/get_match_status`,
        {
          params: {
            Ac_Code: ac_code,
            Company_Code: company_code,
            Year_Code: year_code,
          },
        }
      );
      return data.match_status;
    } catch (error) {
      toast.error("Error checking GST State Code match.");
      console.error("Couldn't able to match GST State Code:", error);
      return error;
    }
  };

  const calculateTotalItemAmount = (users) => {
    return users
      .filter((user) => user.rowaction !== "delete" && user.rowaction !== "DNU")
      .reduce((sum, user) => sum + parseFloat(user.item_Amount || 0), 0);
  };

  const handleMill_Code = (code, accoid) => {
    setMillCode(code);
    setFormData({
      ...formData,
      Mill_Code: code,
      mc: accoid,
    });
  };
  const handleGrade = (code) => {
    setGrade(code);
    setFormData({
      ...formData,
      Grade: code,
    });
  };
  const handlePayment_To = (code, accoid) => {
    setPaymentTo(code);
    setFormData({
      ...formData,
      Payment_To: code,
      pt: accoid,
    });
  };
  const handleTender_From = (code, accoid) => {
    setTenderFrom(code);
    setFormData({
      ...formData,
      Tender_From: code,
      tf: accoid,
    });
  };
  const handleTender_DO = (code, accoid) => {
    setTenderDO(code);
    setFormData({
      ...formData,
      Tender_DO: code,
      td: accoid,
    });
  };
  const handleVoucher_By = (code, accoid) => {
    setVoucherBy(code);
    setFormData({
      ...formData,
      Voucher_By: code,
      vb: accoid,
    });
  };
  const handleBroker = (code, accoid) => {
    setBroker(code);
    setFormData({
      ...formData,
      Broker: code,
      bk: accoid,
    });
  };
  const handleitemcode = (code, accoid) => {
    setItemCode(code);
    setFormData({
      ...formData,
      itemcode: code,
      ic: accoid,
    });
  };
  const handlegstratecode = (code, rate) => {
    setGSTRate(code);
    setGstCode(rate);
    setFormData({
      ...formData,
      gstratecode: code,
    });
  };
  const handleBp_Account = (code, accoid) => {
    setBpAcCode(code);
    setFormData({
      ...formData,
      Bp_Account: code,
      bp: accoid,
    });
  };

  const handleBillTo = (code, accoid, name) => {
    setBillTo(code);
    setBillToName(name);
    setFormDataDetail({
      ...formDataDetail,
      Buyer: code,
      buyerid: accoid,
    });
  };

  const handleShipTo = (code, accoid, name) => {
    setShipTo(code);
    setShipToName(name);
    setFormDataDetail({
      ...formDataDetail,
      Buyer_Party: code,
      buyerpartyid: accoid,
    });
  };

  const handleDetailSubBroker = (code, accoid, name) => {
    setSubBroker(code);
    setBrokerDetail(name);
    setFormDataDetail({
      ...formDataDetail,
      sub_broker: code,
      sbr: accoid,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  // Handle change for all inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChangeDetail = (event) => {
    const { name, value } = event.target;
    setFormDataDetail((prevDetail) => {
      const updatedDetail = {
        ...prevDetail,
        [name]:
          name === "Buyer_Quantal" ||
          name === "Sale_Rate" ||
          name === "Commission_Rate"
            ? parseInt(value) || 0
            : parseFloat(value) || value,
      };

      const { Quantal, packing, rate } = updatedDetail;
      const { bags, item_Amount } = calculateDetails(Quantal, packing, rate);

      updatedDetail.bags = bags;
      updatedDetail.item_Amount = item_Amount;

      return updatedDetail;
    });
  };

  const handleDateChange = (event, fieldName) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: event.target.value,
    }));
  };

  const handleDetailDateChange = (event, fieldName) => {
    setFormDataDetail((prevFormDetailData) => ({
      ...prevFormDetailData,
      [fieldName]: event.target.value,
    }));
  };

  const handleCheckbox = (e, valueType = "string") => {
    const { name, checked } = e.target;

    // Determine the value to set based on the valueType parameter
    const value =
      valueType === "numeric" ? (checked ? 1 : 0) : checked ? "Y" : "N";

    setFormData((prevState) => ({
      ...prevState,
      [name]: value, // Set the appropriate value based on valueType
    }));
  };

  const addUser = async (e) => {
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1,
      Buyer: billTo,
      billtoName: billtoName,
      buyerid: billToAccoid,
      Buyer_Party: shipTo,
      shiptoName: shiptoName,
      buyerpartyid: shipToAccoid,
      sub_broker: subBroker,
      brokerDetail: brokerDetail,
      sbr: subBrokerAccoid,

      ...formDataDetail,
      rowaction: "add",
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);

    // const netQuantal = calculateNetQuantal(updatedUsers);

    // const subtotal = calculateTotalItemAmount(updatedUsers);
    // let updatedFormData = {
    //   ...formData,
    //   NETQNTL: netQuantal,
    //   subTotal: subtotal,
    // };

    // const matchStatus = await checkMatchStatus(
    //   updatedFormData.Ac_Code,
    //   companyCode,
    //   Year_Code
    // );
    // let gstRate = GstRate;
    // if (!gstRate || gstRate === 0) {
    //   const cgstRate = parseFloat(formData.CGSTRate) || 0;
    //   const sgstRate = parseFloat(formData.SGSTRate) || 0;
    //   const igstRate = parseFloat(formData.IGSTRate) || 0;

    //   gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
    // }

    // updatedFormData = await calculateDependentValues(
    //   "GstRateCode",
    //   gstRate,
    //   updatedFormData,
    //   matchStatus,
    //   gstRate
    // );

    // setFormData(updatedFormData);

    closePopup();
  };

  const updateUser = async () => {
    const updatedUsers = users.map((user) => {
      if (user.id === selectedUser.id) {
        const updatedRowaction =
          user.rowaction === "Normal" ? "update" : user.rowaction;
        return {
          ...user,

          Buyer: billTo,
          billtoName: billtoName,
          Buyer_Party: shipTo,
          shiptoName: shiptoName,
          sub_broker: subBroker,
          brokerDetail: brokerDetail,
          BP_Detail: formDataDetail.BP_Detail,
          Buyer_Quantal: formDataDetail.Buyer_Quantal,
          CashDiff: formDataDetail.CashDiff,
          Commission_Rate: formDataDetail.Commission_Rate,
          DetailBrokrage: formDataDetail.DetailBrokrage,
          Lifting_Date: formDataDetail.Lifting_Date,
          Narration: formDataDetail.Narration,
          Sale_Rate: formDataDetail.Sale_Rate,
          Sauda_Date: formDataDetail.Sauda_Date,
          gst_amt: formDataDetail.gst_amt,
          gst_rate: formDataDetail.gst_rate,
          loding_by_us: formDataDetail.loding_by_us,
          Delivery_Type: formDataDetail.Delivery_Type,

          rowaction: updatedRowaction,
        };
      } else {
        return user;
      }
    });

    setUsers(updatedUsers);

    // const netQuantal = calculateNetQuantal(updatedUsers);

    // const subtotal = calculateTotalItemAmount(updatedUsers);

    // let updatedFormData = {
    //   ...formData,
    //   NETQNTL: netQuantal,
    //   subTotal: subtotal,
    // };
    // const matchStatus = await checkMatchStatus(
    //   updatedFormData.Ac_Code,
    //   companyCode,
    //   Year_Code
    // );

    // let gstRate = GstRate;
    // if (!gstRate || gstRate === 0) {
    //   const cgstRate = parseFloat(formData.CGSTRate) || 0;
    //   const sgstRate = parseFloat(formData.SGSTRate) || 0;
    //   const igstRate = parseFloat(formData.IGSTRate) || 0;

    //   gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
    // }

    // updatedFormData = await calculateDependentValues(
    //   "GstRateCode", // Pass the name of the field being changed
    //   gstRate, // Pass the correct gstRate
    //   updatedFormData,
    //   matchStatus,
    //   gstRate // Pass gstRate explicitly to calculateDependentValues
    // );

    // setFormData(updatedFormData);

    closePopup();
  };

  const deleteModeHandler = async (user) => {
    let updatedUsers;
    if (isEditMode && user.rowaction === "add") {
      setDeleteMode(true);
      setSelectedUser(user);
      console.log("selectedUser", selectedUser);
      updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, rowaction: "DNU" } : u
      );
    } else if (isEditMode) {
      setDeleteMode(true);
      setSelectedUser(user);
      updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, rowaction: "delete" } : u
      );
    } else {
      setDeleteMode(true);
      setSelectedUser(user);
      console.log("selectedUser", selectedUser);
      updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, rowaction: "DNU" } : u
      );
    }
    setUsers(updatedUsers);
    setSelectedUser({});

    // const netQuantal = calculateNetQuantal(updatedUsers);

    // const subtotal = calculateTotalItemAmount(updatedUsers);
    // let updatedFormData = {
    //   ...formData,
    //   NETQNTL: netQuantal,
    //   subTotal: subtotal,
    // };

    // const matchStatus = await checkMatchStatus(
    //   updatedFormData.Ac_Code,
    //   companyCode,
    //   Year_Code
    // );

    // let gstRate = GstRate;
    // if (!gstRate || gstRate === 0) {
    //   const cgstRate = parseFloat(formData.CGSTRate) || 0;
    //   const sgstRate = parseFloat(formData.SGSTRate) || 0;
    //   const igstRate = parseFloat(formData.IGSTRate) || 0;

    //   gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
    // }

    // updatedFormData = await calculateDependentValues(
    //   "GstRateCode", // Pass the name of the field being changed
    //   gstRate, // Pass the correct gstRate
    //   updatedFormData,
    //   matchStatus,
    //   gstRate // Pass gstRate explicitly to calculateDependentValues
    // );

    // setFormData(updatedFormData);
  };

  const openDelete = async (user) => {
    setDeleteMode(true);
    setSelectedUser(user);
    let updatedUsers;
    if (isEditMode && user.rowaction === "delete") {
      updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, rowaction: "Normal" } : u
      );
    } else {
      updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, rowaction: "add" } : u
      );
    }
    setUsers(updatedUsers);
    setSelectedUser({});

    // const netQuantal = calculateNetQuantal(updatedUsers);

    // const subtotal = calculateTotalItemAmount(updatedUsers);
    // let updatedFormData = {
    //   ...formData,
    //   NETQNTL: netQuantal,
    //   subTotal: subtotal,
    // };

    // const matchStatus = await checkMatchStatus(
    //   updatedFormData.Ac_Code,
    //   companyCode,
    //   Year_Code
    // );

    // let gstRate = GstRate;
    // if (!gstRate || gstRate === 0) {
    //   const cgstRate = parseFloat(formData.CGSTRate) || 0;
    //   const sgstRate = parseFloat(formData.SGSTRate) || 0;
    //   const igstRate = parseFloat(formData.IGSTRate) || 0;

    //   gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
    // }

    // updatedFormData = await calculateDependentValues(
    //   "GstRateCode", // Pass the name of the field being changed
    //   gstRate, // Pass the correct gstRate
    //   updatedFormData,
    //   matchStatus,
    //   gstRate // Pass gstRate explicitly to calculateDependentValues
    // );

    // setFormData(updatedFormData);
  };

  const openPopup = (mode) => {
    setPopupMode(mode);
    setShowPopup(true);
    if (mode === "add") {
      clearForm();
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedUser({});
    clearForm();
  };

  const clearForm = () => {
    setFormDataDetail({
      narration: "",
      packing: 0,
      Quantal: 0.0,
      bags: 0,
      rate: 0.0,
      item_Amount: 0.0,
    });
    setBillTo("");
    setShipTo("");
    setSubBroker("");
  };

  const editUser = (user) => {
    setSelectedUser(user);
    console.log("selectedUser", selectedUser);
    setBillTo(user.Buyer);
    setShipTo(user.Buyer_Party);
    setSubBroker(user.sub_broker);

    setFormDataDetail({
      Buyer_Quantal: user.Buyer_Quantal || 0.0,
      Sale_Rate: user.Sale_Rate || 0.0,
      Commission_Rate: user.Commission_Rate || 0.0,
      Sauda_Date: user.Sauda_Date || 0.0,
      Lifting_Date: user.Lifting_Date || 0.0,
      Narration: user.Narration || 0.0,
      tcs_rate: user.tcs_rate || 0.0,
      gst_rate: user.gst_rate || 0.0,
      tcs_amt: user.tcs_amt || 0.0,
      gst_amt: user.gst_amt || 0.0,
      CashDiff: user.CashDiff || 0.0,
      BP_Detail: user.BP_Detail || 0.0,
      loding_by_us: user.loding_by_us || 0.0,
      DetailBrokrage: user.DetailBrokrage || 0.0,
    });
    openPopup("edit");
  };

  useEffect(() => {
    if (selectedRecord) {
      setUsers(
        lastTenderDetails.map((detail) => ({
          Buyer: detail.Buyer,
          billtoName: detail.billtoName,
          Buyer_Party: detail.Buyer_Party,
          shiptoName: detail.shiptoName,
          sub_broker: detail.sub_broker,
          brokerDetail: detail.brokerDetail,
          BP_Detail: detail.BP_Detail,
          Buyer_Quantal: detail.Buyer_Quantal,
          CashDiff: detail.CashDiff,
          Commission_Rate: detail.Commission_Rate,
          DetailBrokrage: detail.DetailBrokrage,
          Lifting_Date: detail.Lifting_Date,
          Narration: detail.Narration,
          Sale_Rate: detail.Sale_Rate,
          Sauda_Date: detail.Sauda_Date,
          gst_amt: detail.gst_amt,
          gst_rate: detail.gst_rate,
          loding_by_us: detail.loding_by_us,
          Delivery_Type: detail.Delivery_Type,
          tenderdetailid: detail.tenderdetailid,
          id: detail.tenderdetailid,
          tcs_rate: detail.tcs_rate,
          tcs_amt: detail.tcs_amt,

          rowaction: "Normal",
        }))
      );
    }
  }, [selectedRecord, lastTenderDetails]);

  useEffect(() => {
    const updatedUsers = lastTenderDetails.map((detail) => ({
      Buyer: detail.Buyer,
      billtoName: detail.buyername,
      Buyer_Party: detail.Buyer_Party,
      shiptoName: detail.buyerpartyname,
      sub_broker: detail.sub_broker,
      brokerDetail: detail.subbrokername,
      BP_Detail: detail.BP_Detail,
      Buyer_Quantal: detail.Buyer_Quantal,
      CashDiff: detail.CashDiff,
      Commission_Rate: detail.Commission_Rate,
      DetailBrokrage: detail.DetailBrokrage,
      Lifting_Date: detail.payment_dateConverted,
      Narration: detail.Narration,
      Sale_Rate: detail.Sale_Rate,
      Sauda_Date: detail.Sauda_DateConverted,
      gst_amt: detail.gst_amt,
      gst_rate: detail.gst_rate,
      loding_by_us: detail.loding_by_us,
      Delivery_Type: detail.Delivery_Type,
      tenderdetailid: detail.tenderdetailid,
      id: detail.tenderdetailid,
      tcs_rate: detail.tcs_rate,
      tcs_amt: detail.tcs_amt,

      rowaction: "Normal",
    }));
    setUsers(updatedUsers);
    console.log(lastTenderDetails);
  }, [lastTenderDetails]);

  const fetchLastRecord = () => {
    fetch(
      `${API_URL}/getNextDocNo_SugarPurchaseReturnHead?Company_Code=${companyCode}&Year_Code=${Year_Code}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch last record");
        }
        return response.json();
      })
      .then((data) => {
        setFormData({
          Tender_No: data.next_doc_no,
        });
      })
      .catch((error) => {
        console.error("Error fetching last record:", error);
      });
  };

  const handleAddOne = () => {
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setIsEditing(true);
    fetchLastRecord();
    setFormData(initialFormData);
  };

  const handleSaveOrUpdate = async () => {
    setIsEditing(true);
    setIsLoading(true);

    const headData = {
      ...formData,
      gstratecode: gstCode,
    };

    // Remove dcid from headData if in edit mode
    if (isEditMode) {
      delete headData.tenderid;
    }
    const detailData = users.map((user) => ({
      rowaction: user.rowaction,
      Buyer: user.Buyer,
      Buyer_Quantal: user.Buyer_Quantal,
      Sale_Rate: user.Sale_Rate,
      Commission_Rate: user.Commission_Rate,
      Sauda_Date: user.Sauda_Date,
      Lifting_Date: user.Lifting_Date,
      Narration: user.Narration,
      ID: user.ID,
      Buyer_Party: user.Buyer_Party,
      AutoID: user.AutoID,
      IsActive: user.IsActive,
      year_code: user.year_code,
      Branch_Id: user.Branch_Id,
      Delivery_Type: user.Delivery_Type,
      tenderdetailid: user.tenderdetailid,
      buyerid: user.buyerid,
      buyerpartyid: user.buyerpartyid,
      sub_broker: user.sub_broker,
      sbr: user.sbr,
      tcs_rate: user.tcs_rate,
      gst_rate: user.gst_rate,
      tcs_amt: user.tcs_amt,
      gst_amt: user.gst_amt,

      ShipTo: user.shipTo,
      CashDiff: user.CashDiff,
      shiptoid: user.shiptoid,
      BP_Detail: user.BP_Detail,
      bpid: user.bpid,

      loding_by_us: user.loding_by_us,
      DetailBrokrage: user.DetailBrokrage,
    }));
    const requestData = {
      headData,
      detailData,
    };
    try {
      if (isEditMode) {
        const updateApiUrl = `${API_URL}/update_tender_purchase?tenderid=${newTenderId}`;
        const response = await axios.put(updateApiUrl, requestData);
        toast.success("Data updated successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const response = await axios.post(
          `${API_URL}/insert_tender_head_detail`,
          requestData
        );
        toast.success("Data saved successfully!");
        setIsEditMode(false);
        setAddOneButtonEnabled(true);
        setEditButtonEnabled(true);
        setDeleteButtonEnabled(true);
        setBackButtonEnabled(true);
        setSaveButtonEnabled(false);
        setCancelButtonEnabled(false);
        setIsEditing(true);
        // setTimeout(() => {
        //   window.location.reload();
        // }, 1000);
      }
    } catch (error) {
      console.error("Error during API call:", error);
      toast.error("Error occurred while saving data");
    } finally {
      setIsEditing(false);
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setBackButtonEnabled(true);
    setIsEditing(true);
  };
  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete this Task No ${formData.Tender_No}?`
    );
    if (isConfirmed) {
      setIsEditMode(false);
      setAddOneButtonEnabled(true);
      setEditButtonEnabled(true);
      setDeleteButtonEnabled(true);
      setBackButtonEnabled(true);
      setSaveButtonEnabled(false);
      setCancelButtonEnabled(false);
      setIsLoading(true);

      try {
        const deleteApiUrl = `${API_URL}/delete-sugarpurchasereturn?prid=${newTenderId}&Company_Code=${companyCode}&doc_no=${formData.doc_no}&Year_Code=${Year_Code}&tran_type=${formData.Tran_Type}`;
        const response = await axios.delete(deleteApiUrl);

        if (response.status === 200) {
          toast.success("Data delete successfully!!");
          handleCancel();
        } else {
          console.error(
            "Failed to delete tender:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error during API call:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("Deletion cancelled");
    }
  };

  // handleCancel button cliked show the last record for edit functionality
  const handleCancel = async () => {
    setIsEditing(false);
    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    setCancelButtonClicked(true);
    try {
      const response = await axios.get(
        `${API_URL}/getlasttender_record_navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}`
      );
      if (response.status === 200) {
        const data = response.data;
        newTenderId = data.last_tender_head_data.tenderid;
        millCodeName = data.last_tender_details_data[0].MillName;
        newMill_Code = data.last_tender_head_data.Mill_Code;
        newGrade = data.last_tender_head_data.Grade;
        paymentToName = data.last_tender_details_data[0].PaymentToAcName;
        newPayment_To = data.last_tender_head_data.Payment_To;
        tenderFromName = data.last_tender_details_data[0].TenderFromAcName;
        newTender_From = data.last_tender_head_data.Tender_From;
        tenderDOName = data.last_tender_details_data[0].TenderDoAcName;
        newTender_DO = data.last_tender_head_data.Tender_DO;
        voucherByName = data.last_tender_details_data[0].VoucherByAcName;
        newVoucher_By = data.last_tender_head_data.Voucher_By;
        brokerName = data.last_tender_details_data[0].BrokerAcName;
        newBroker = data.last_tender_head_data.Broker;
        itemName = data.last_tender_details_data[0].ItemName;
        newitemcode = data.last_tender_head_data.itemcode;
        gstRateName = data.last_tender_details_data[0].GST_Name;
        gstRateCode = data.last_tender_details_data[0].GSTRate;
        newgstratecode = data.last_tender_head_data.gstratecode;
        bpAcName = data.last_tender_details_data[0].BPAcName;
        newBp_Account = data.last_tender_head_data.Bp_Account;
        billToName = data.last_tender_details_data[0].buyername;
        newBillToCode = data.last_tender_details_data[0].Buyer;
        shipToName = data.last_tender_details_data[0].buyerpartyname;
        shipToCode = data.last_tender_details_data[0].Buyer_Party;
        subBrokerName = data.last_tender_details_data[0].subbrokername;
        subBrokerCode = data.last_tender_details_data[0].sub_broker;

        // Ensure all fields are updated correctly
        setFormData((prevData) => ({
          ...prevData,
          ...data.last_tender_head_data,
        }));
        setLastTenderData(data.last_tender_head_data || {});
        setLastTenderDetails(data.last_tender_details_data || []);
      } else {
        console.error(
          "Failed to fetch last data:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };
  const handleBack = () => {
    navigate("/TenderPurchase-utility");
  };
  //Handle Record DoubleCliked in Utility Page Show that record for Edit
  const handlerecordDoubleClicked = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/get-TenderPurchaseSelectedRecord?Company_Code=${companyCode}&group_Code=${selectedRecord._____}`
      );
      const data = response.data;
      setFormData(data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    setUpdateButtonClicked(true);
    setIsEditing(false);
  };

  useEffect(() => {
    if (selectedRecord) {
      handlerecordDoubleClicked();
    } else {
      handleAddOne();
    }
  }, [selectedRecord]);

  //change No functionality to get that particular record
  const handleKeyDown = async (event) => {
    if (event.key === "Tab") {
      const changeNoValue = event.target.value;
      try {
        const response = await axios.get(
          `${API_URL}/get-TenderPurchaseSelectedRecord?Company_Code=${companyCode}&______=${changeNoValue}`
        );
        const data = response.data;
        setFormData(data);
        setIsEditing(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  //Navigation Buttons
  const handleFirstButtonClick = async () => {
    try {
      const response = await fetch(`${API_URL}/get-first-TenderPurchase`);
      if (response.ok) {
        const data = await response.json();
        // Access the first element of the array
        const firstUserCreation = data[0];

        setFormData({
          ...formData,
          ...firstUserCreation,
        });
      } else {
        console.error(
          "Failed to fetch first record:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  const handlePreviousButtonClick = async () => {
    try {
      // Use formData.Company_Code as the current company code
      const response = await fetch(
        `${API_URL}/get-previous-TenderPurchase?key_code=${formData.key_code}`
      );

      if (response.ok) {
        const data = await response.json();

        // Assuming setFormData is a function to update the form data
        setFormData({
          ...formData,
          ...data,
        });
      } else {
        console.error(
          "Failed to fetch previous record:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  const handleNextButtonClick = async () => {
    try {
      const response = await fetch(
        `${API_URL}/get-next-TenderPurchase?key_code=${formData.key_code}`
      );

      if (response.ok) {
        const data = await response.json();
        // Assuming setFormData is a function to update the form data
        setFormData({
          ...formData,
          ...data.nextSelectedRecord,
        });
      } else {
        console.error(
          "Failed to fetch next record:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  const handleLastButtonClick = async () => {
    try {
      const response = await fetch(`${API_URL}/get-last-TenderPurchase`);
      if (response.ok) {
        const data = await response.json();
        // Access the first element of the array
        const last_Navigation = data[0];

        setFormData({
          ...formData,
          ...last_Navigation,
        });
      } else {
        console.error(
          "Failed to fetch last record:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  return (
    <>
      <ToastContainer />
      <form className="SugarTenderPurchase-container" onSubmit={handleSubmit}>
        <h6 className="Heading">Tender Purchase</h6>
        <div>
          <ActionButtonGroup
            handleAddOne={handleAddOne}
            addOneButtonEnabled={addOneButtonEnabled}
            handleSaveOrUpdate={handleSaveOrUpdate}
            saveButtonEnabled={saveButtonEnabled}
            isEditMode={isEditMode}
            handleEdit={handleEdit}
            editButtonEnabled={editButtonEnabled}
            handleDelete={handleDelete}
            deleteButtonEnabled={deleteButtonEnabled}
            handleCancel={handleCancel}
            cancelButtonEnabled={cancelButtonEnabled}
            handleBack={handleBack}
            backButtonEnabled={backButtonEnabled}
          />

          {/* Navigation Buttons */}
          <NavigationButtons
            handleFirstButtonClick={handleFirstButtonClick}
            handlePreviousButtonClick={handlePreviousButtonClick}
            handleNextButtonClick={handleNextButtonClick}
            handleLastButtonClick={handleLastButtonClick}
            highlightedButton={highlightedButton}
            isEditing={isEditing}
            isFirstRecord={formData.Company_Code === 1}
          />
        </div>

        <div className="SugarTenderPurchase-row"></div>

        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Tender_No"
              className="SugarTenderPurchase-form-label"
            >
              Change No
            </label>
            <input
              type="text"
              className="SugarTenderPurchase-form-control"
              name="changeNo"
              autoComplete="off"
              onKeyDown={handleKeyDown}
              disabled={!addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Tender_No"
              className="SugarTenderPurchase-form-label"
            >
              Tender No:
            </label>
            <input
              type="text"
              id="Tender_No"
              name="Tender_No"
              className="SugarTenderPurchase-form-control"
              value={formData.Tender_No}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Tender_Date"
              className="SugarTenderPurchase-form-label"
            >
              Date:
            </label>
            <input
              type="date"
              id="Tender_Date"
              name="Tender_Date"
              className="SugarTenderPurchase-form-control"
              value={formData.Tender_Date}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Lifting_Date"
              className="SugarTenderPurchase-form-label"
            >
              Payment Date:
            </label>
            <input
              type="date"
              id="Lifting_Date"
              name="Lifting_Date"
              className="SugarTenderPurchase-form-control"
              value={formData.Lifting_Date}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Mill_Code"
              className="SugarTenderPurchase-form-label"
            >
              Mill Code:
            </label>
            <AccountMasterHelp
              name="Mill_Code"
              onAcCodeClick={handleMill_Code}
              CategoryName={millCodeName}
              CategoryCode={newMill_Code}
              tabIndex={5}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
        </div>

        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label htmlFor="Grade" className="SugarTenderPurchase-form-label">
              Grade:
            </label>
            <AccountMasterHelp
              name="Grade"
              onAcCodeClick={handleGrade}
              gradeName={gradeName}
              newGrade={newGrade}
              tabIndex={6}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label htmlFor="Quantal" className="SugarTenderPurchase-form-label">
              Quintal:
            </label>
            <input
              type="text"
              id="Quantal"
              name="Quantal"
              className="SugarTenderPurchase-form-control"
              value={formData.Quantal}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label htmlFor="Packing" className="SugarTenderPurchase-form-label">
              Packing:
            </label>
            <input
              type="text"
              id="Packing"
              name="Packing"
              className="SugarTenderPurchase-form-control"
              value={formData.Packing}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label htmlFor="Bags" className="SugarTenderPurchase-form-label">
              Bags:
            </label>
            <input
              type="text"
              id="Bags"
              name="Bags"
              className="SugarTenderPurchase-form-control"
              value={formData.Bags || calculatedValues.bags}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Payment_To"
              className="SugarTenderPurchase-form-label"
            >
              Payment To:
            </label>
            <AccountMasterHelp
              name="Payment_To"
              onAcCodeClick={handlePayment_To}
              CategoryName={paymentToName}
              CategoryCode={newPayment_To}
              tabIndex={10}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
        </div>
        <div className="SugarTenderPurchase-row"></div>
        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Tender_From"
              className="SugarTenderPurchase-form-label"
            >
              Tender From:
            </label>
            <AccountMasterHelp
              name="Tender_From"
              onAcCodeClick={handleTender_From}
              CategoryName={tenderFromName}
              CategoryCode={newTender_From}
              tabIndex={11}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Tender_DO"
              className="SugarTenderPurchase-form-label"
            >
              Tender D.O.:
            </label>
            <AccountMasterHelp
              name="Tender_DO"
              onAcCodeClick={handleTender_DO}
              CategoryName={tenderDOName}
              CategoryCode={newTender_DO}
              tabIndex={12}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Voucher_By"
              className="SugarTenderPurchase-form-label"
            >
              Voucher By:
            </label>
            <AccountMasterHelp
              name="Voucher_By"
              onAcCodeClick={handleVoucher_By}
              CategoryName={voucherByName}
              CategoryCode={newVoucher_By}
              tabIndex={13}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
        </div>
        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label htmlFor="Broker" className="SugarTenderPurchase-form-label">
              Broker:
            </label>
            <AccountMasterHelp
              name="Broker"
              onAcCodeClick={handleBroker}
              CategoryName={brokerName}
              CategoryCode={newBroker}
              tabIndex={14}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Excise_Rate"
              className="SugarTenderPurchase-form-label"
            >
              Excise/GST Rate:
            </label>
            <input
              type="text"
              id="Excise_Rate"
              name="Excise_Rate"
              className="SugarTenderPurchase-form-control"
              value={formData.Excise_Rate || calculatedValues.exciseRate}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Narration"
              className="SugarTenderPurchase-form-label"
            >
              Narration:
            </label>
            <textarea
              type="text"
              id="Narration"
              name="Narration"
              className="SugarTenderPurchase-form-control"
              value={formData.Narration}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Mill_Rate"
              className="SugarTenderPurchase-form-label"
            >
              Mill Rate:
            </label>
            <input
              type="text"
              id="Mill_Rate"
              name="Mill_Rate"
              className="SugarTenderPurchase-form-control"
              value={formData.Mill_Rate}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Purc_Rate"
              className="SugarTenderPurchase-form-label"
            >
              Purchase Rate:
            </label>
            <input
              type="text"
              id="Purc_Rate"
              name="Purc_Rate"
              className="SugarTenderPurchase-form-control"
              value={formData.Purc_Rate}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
        </div>
        <div className="SugarTenderPurchase-row"></div>
        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label htmlFor="type" className="SugarTenderPurchase-form-label">
              Resale/Mill:
            </label>
            <input
              type="text"
              id="type"
              name="type"
              className="SugarTenderPurchase-form-control"
              value={formData.type}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Voucher_No"
              className="SugarTenderPurchase-form-label"
            >
              Voucher No:
            </label>
            <input
              type="text"
              id="Voucher_No"
              name="Voucher_No"
              className="SugarTenderPurchase-form-control"
              value={formData.Voucher_No}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Sell_Note_No"
              className="SugarTenderPurchase-form-label"
            >
              Sell Note No:
            </label>
            <input
              type="text"
              id="Sell_Note_No"
              name="Sell_Note_No"
              className="SugarTenderPurchase-form-control"
              value={formData.Sell_Note_No}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Brokrage"
              className="SugarTenderPurchase-form-label"
            >
              Brokerage:
            </label>
            <input
              type="text"
              id="Brokrage"
              name="Brokrage"
              className="SugarTenderPurchase-form-control"
              value={formData.Brokrage}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
        </div>
        <div className="SugarTenderPurchase-row"></div>
        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="itemcode"
              className="SugarTenderPurchase-form-label"
            >
              Item Code:
            </label>
            <AccountMasterHelp
              name="itemcode"
              onAcCodeClick={handleitemcode}
              itemName={itemName}
              newitemcode={newitemcode}
              tabIndex={29}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label htmlFor="season" className="SugarTenderPurchase-form-label">
              Season:
            </label>
            <input
              type="text"
              id="season"
              name="season"
              className="SugarTenderPurchase-form-control"
              value={formData.season}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="gstratecode"
              className="SugarTenderPurchase-form-label"
            >
              GST Rate:
            </label>
            <GSTRateMasterHelp
              onAcCodeClick={handlegstratecode}
              GstRateName={gstRateName}
              GstRateCode={gstRateCode}
              name="gstratecode"
              tabIndexHelp={8}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label htmlFor="GSTAmt" className="SugarTenderPurchase-form-label">
              GST Amount
            </label>
            <input
              type="text"
              id="GSTAmt"
              name="GSTAmt"
              className="SugarTenderPurchase-form-control"
              value={calculatedValues.gstAmt}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <label>{calculatedValues.lblValue}</label>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="CashDiff"
              className="SugarTenderPurchase-form-label"
            >
              Diff:
            </label>
            <input
              type="text"
              id="CashDiff"
              name="CashDiff"
              className="SugarTenderPurchase-form-control"
              value={formData.CashDiff || calculatedValues.diff}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <label>{calculatedValues.amount}</label>
        </div>
        <div className="SugarTenderPurchase-row"></div>
        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="TCS_Rate"
              className="SugarTenderPurchase-form-label"
            >
              TCS%:
            </label>
            <input
              type="text"
              id="TCS_Rate"
              name="TCS_Rate"
              className="SugarTenderPurchase-form-control"
              value={formData.TCS_Rate}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label htmlFor="TCS_Amt" className="SugarTenderPurchase-form-label">
              TCS Amount:
            </label>
            <input
              type="text"
              id="TCS_Amt"
              name="TCS_Amt"
              className="SugarTenderPurchase-form-control"
              value={formData.TCS_Amt || calculatedValues.tcsAmt}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Party_Bill_Rate"
              className="SugarTenderPurchase-form-label"
            >
              Party Bill Rate:
            </label>
            <input
              type="text"
              id="Party_Bill_Rate"
              name="Party_Bill_Rate"
              className="SugarTenderPurchase-form-control"
              value={formData.Party_Bill_Rate}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="TDS_Rate"
              className="SugarTenderPurchase-form-label"
            >
              TDS Rate:
            </label>
            <input
              type="text"
              id="TDS_Rate"
              name="TDS_Rate"
              className="SugarTenderPurchase-form-control"
              value={formData.TDS_Rate}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label htmlFor="TDS_Amt" className="SugarTenderPurchase-form-label">
              TDS Amount:
            </label>
            <input
              type="text"
              id="TDS_Amt"
              name="TDS_Amt"
              className="SugarTenderPurchase-form-control"
              value={formData.TDS_Amt}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Temptender"
              className="SugarTenderPurchase-form-label"
            >
              :
            </label>
            <input
              type="text"
              id="Temptender"
              name="Temptender"
              className="SugarTenderPurchase-form-control"
              value={formData.Temptender}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
        </div>
        <div className="SugarTenderPurchase-row"></div>
        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="AutoPurchaseBill"
              className="SugarTenderPurchase-form-label"
            >
              Auto Purchase Bill:
            </label>
            <input
              type="text"
              id="AutoPurchaseBill"
              name="AutoPurchaseBill"
              className="SugarTenderPurchase-form-control"
              value={formData.AutoPurchaseBill}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Bp_Account"
              className="SugarTenderPurchase-form-label"
            >
              BP A/C:
            </label>
            <AccountMasterHelp
              name="Bp_Account"
              onAcCodeClick={handleBp_Account}
              CategoryName={bpAcName}
              CategoryCode={newBp_Account}
              tabIndex={48}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="groupTenderNo"
              className="SugarTenderPurchase-form-label"
            >
              Group Tender No:
            </label>
            <input
              type="text"
              id="groupTenderNo"
              name="groupTenderNo"
              className="SugarTenderPurchase-form-control"
              value={formData.groupTenderNo}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
        </div>
        <div className="SugarTenderPurchase-row"></div>

        {/*detail part popup functionality and Validation part Grid view */}
        <div className="">
          {showPopup && (
            <div className="modal" role="dialog" style={{ display: "block" }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {selectedUser.id ? "Edit User" : "Add User"}
                    </h5>
                    <button
                      type="button"
                      onClick={closePopup}
                      aria-label="Close"
                      style={{
                        marginLeft: "80%",
                        width: "60px",
                        height: "30px",
                      }}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <form>
                      <label>Bill To</label>
                      <div className="form-element">
                        <AccountMasterHelp
                          onAcCodeClick={handleBillTo}
                          CategoryName={billtoName}
                          CategoryCode={billTo}
                          name="Buyer"
                          tabIndexHelp={3}
                          className="account-master-help"
                        />
                      </div>

                      <label>Ship To</label>
                      <div className="form-element">
                        <AccountMasterHelp
                          onAcCodeClick={handleShipTo}
                          CategoryName={shiptoName}
                          CategoryCode={shipTo}
                          name="Buyer_Party"
                          tabIndexHelp={3}
                          className="account-master-help"
                        />
                      </div>

                      <label htmlFor="Delivery_Type">Delivery Type:</label>
                      <select
                        id="Delivery_Type"
                        name="Delivery_Type"
                        value={formDataDetail.Delivery_Type}
                        onChange={handleChangeDetail}
                        disabled={!isEditing && addOneButtonEnabled}
                      >
                        <option value="N">With GST Naka Delivery</option>
                        <option value="A">
                          Naka Delivery without GST Rate
                        </option>
                        <option value="C">Commission</option>
                        <option value="D">DO</option>
                      </select>
                      <label className="SugarTenderPurchase-form-label">
                        Broker
                      </label>

                      <AccountMasterHelp
                        onAcCodeClick={handleBroker}
                        CategoryName={brokerName}
                        CategoryCode={newBroker}
                        name="Broker"
                        tabIndexHelp={3}
                        className="account-master-help"
                      />

                      <label className="SugarTenderPurchase-form-label">
                        Sub Broker:
                      </label>
                      <div className="SugarTenderPurchase-col-Ewaybillno">
                        <div className="SugarTenderPurchase-form-group">
                          <AccountMasterHelp
                            onAcCodeClick={handleDetailSubBroker}
                            CategoryName={brokerDetail}
                            CategoryCode={subBroker}
                            name="sub_broker"
                            tabIndexHelp={3}
                            className="account-master-help"
                          />
                        </div>
                      </div>
                      <label className="SugarTenderPurchase-form-label">
                        Buyer Quantal:
                      </label>
                      <div className="SugarTenderPurchase-col-Ewaybillno">
                        <div className="SugarTenderPurchase-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarTenderPurchase-form-control"
                            name="Buyer_Quantal"
                            autoComplete="off"
                            value={formDataDetail.Buyer_Quantal}
                            onChange={handleChangeDetail}
                          />
                        </div>
                      </div>
                      <label className="SugarTenderPurchase-form-label">
                        Sale Rate
                      </label>
                      <div className="SugarTenderPurchase-col-Ewaybillno">
                        <div className="SugarTenderPurchase-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarTenderPurchase-form-control"
                            name="Sale_Rate"
                            autoComplete="off"
                            value={formDataDetail.Sale_Rate}
                            onChange={handleChangeDetail}
                          />
                        </div>
                      </div>
                      <label className="SugarTenderPurchase-form-label">
                        Commission Rate
                      </label>
                      <div className="SugarTenderPurchase-col-Ewaybillno">
                        <div className="SugarTenderPurchase-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarTenderPurchase-form-control"
                            name="Commission_Rate"
                            autoComplete="off"
                            value={formDataDetail.Commission_Rate}
                            onChange={handleChangeDetail}
                          />
                        </div>
                      </div>
                      <label className="SugarTenderPurchase-form-label">
                        Sauda Date
                      </label>
                      <div className="SugarTenderPurchase-col-Ewaybillno">
                        <div className="SugarTenderPurchase-form-group">
                          <input
                            tabIndex="1"
                            type="date"
                            className="SugarTenderPurchase-form-control"
                            id="datePicker"
                            name="Sauda_Date"
                            value={formDataDetail.Sauda_Date}
                            onChange={(e) =>
                              handleDetailDateChange(e, "Sauda_Date")
                            }
                            disabled={!isEditing && addOneButtonEnabled}
                          />
                        </div>
                      </div>
                      <label className="SugarTenderPurchase-form-label">
                        Payment Date
                      </label>
                      <div className="SugarTenderPurchase-col-Ewaybillno">
                        <div className="SugarTenderPurchase-form-group">
                          <input
                            tabIndex="1"
                            type="date"
                            className="SugarTenderPurchase-form-control"
                            id="datePicker"
                            name="Lifting_Date"
                            value={formDataDetail.Lifting_Date}
                            onChange={(e) =>
                              handleDetailDateChange(e, "Lifting_Date")
                            }
                            disabled={!isEditing && addOneButtonEnabled}
                          />
                        </div>
                      </div>

                      <label className="SugarTenderPurchase-form-label">
                        Narration:
                      </label>
                      <div className="SugarTenderPurchase-col-Ewaybillno">
                        <div className="SugarTenderPurchase-form-group">
                          <textarea
                            tabIndex="5"
                            className="SugarTenderPurchase-form-control"
                            name="Narration"
                            autoComplete="off"
                            value={formDataDetail.Narration}
                            onChange={handleChangeDetail}
                          />
                        </div>
                      </div>

                      <label className="SugarTenderPurchase-form-label">
                        Loading By Us
                      </label>
                      <div className="SugarTenderPurchase-col-Ewaybillno">
                        <div className="SugarTenderPurchase-form-group">
                          <input
                            type="checkbox"
                            id="loadingbyus"
                            Name="loadingbyus"
                            checked={formData.loadingbyus === "Y"}
                            onChange={(e) => handleCheckbox(e, "string")}
                            disabled={!isEditing && addOneButtonEnabled}
                          />
                        </div>
                      </div>
                      <label className="SugarTenderPurchase-form-label">
                        GST Amount
                      </label>
                      <div className="SugarTenderPurchase-col-Ewaybillno">
                        <div className="SugarTenderPurchase-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarTenderPurchase-form-control"
                            name="gst_rate"
                            autoComplete="off"
                            value={formDataDetail.gst_rate}
                            onChange={handleChangeDetail}
                          />
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarTenderPurchase-form-control"
                            name="gst_amt"
                            autoComplete="off"
                            value={formDataDetail.gst_amt}
                            onChange={handleChangeDetail}
                          />
                        </div>
                      </div>
                      <label className="SugarTenderPurchase-form-label">
                        TCS Amount
                      </label>
                      <div className="SugarTenderPurchase-col-Ewaybillno">
                        <div className="SugarTenderPurchase-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarTenderPurchase-form-control"
                            name="tcs_rate"
                            autoComplete="off"
                            value={formDataDetail.tcs_rate}
                            onChange={handleChangeDetail}
                          />
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarTenderPurchase-form-control"
                            name="tcs_amt"
                            autoComplete="off"
                            value={formDataDetail.tcs_amt}
                            onChange={handleChangeDetail}
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="modal-footer">
                    {selectedUser.id ? (
                      <button
                        className="btn btn-primary"
                        onClick={updateUser}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            updateUser();
                          }
                        }}
                      >
                        Update User
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={addUser}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            addUser();
                          }
                        }}
                      >
                        Add User
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closePopup}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                height: "35px",
                marginTop: "25px",
                marginRight: "10px",
              }}
            >
              <button
                className="btn btn-primary"
                onClick={() => openPopup("add")}
                tabIndex="16"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    openPopup("add");
                  }
                }}
              >
                Add
              </button>
              <button
                className="btn btn-danger"
                disabled={!isEditing}
                style={{ marginLeft: "10px" }}
                tabIndex="17"
              >
                Close
              </button>
            </div>
            <table className="table mt-4 table-bordered">
              <thead>
                <tr>
                  <th>Actions</th>
                  {/* <th>ID</th>
                <th>RowAction</th> */}
                  <th>Party</th>
                  <th>Party Name</th>
                  <th>Broker</th>
                  <th>Broker Name</th>
                  <th>ShipTo</th>
                  <th>ShipTo Name</th>
                  <th>Quintal</th>
                  <th>Sale Rate</th>
                  <th>Cash Difference</th>
                  <th>Commission</th>
                  <th>Sauda Date</th>
                  <th>Lifting_Date</th>
                  <th>Sauda_Narration</th>
                  <th>Delivery_Type</th>
                  <th>GSTRate</th>
                  <th>GSTAmt</th>
                  <th>TCSRate</th>
                  <th>TCSAmount</th>
                  {/* <th>Saledetailid</th> */}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.rowaction === "add" ||
                      user.rowaction === "update" ||
                      user.rowaction === "Normal" ? (
                        <>
                          <button
                            className="btn btn-warning"
                            onClick={() => editUser(user)}
                            disabled={!isEditing}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                editUser(user);
                              }
                            }}
                            tabIndex="18"
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger ms-2"
                            onClick={() => deleteModeHandler(user)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                deleteModeHandler(user);
                              }
                            }}
                            disabled={!isEditing}
                            tabIndex="19"
                          >
                            Delete
                          </button>
                        </>
                      ) : user.rowaction === "DNU" ||
                        user.rowaction === "delete" ? (
                        <button
                          className="btn btn-secondary"
                          onClick={() => openDelete(user)}
                        >
                          Open
                        </button>
                      ) : null}
                    </td>
                    {/* <td>{user.id}</td>
                  <td>{user.rowaction}</td> */}
                    <td>{user.Buyer}</td>
                    <td>{user.billtoName}</td>
                    <td>{user.sub_broker}</td>
                    <td>{user.brokerDetail}</td>
                    <td>{user.Buyer_Party}</td>
                    <td>{user.shiptoName}</td>
                    <td>{user.Buyer_Quantal}</td>
                    <td>{user.Sale_Rate}</td>
                    <td>{user.CashDiff}</td>
                    <td>{user.Commission_Rate}</td>
                    <td>{user.Sauda_Date}</td>
                    <td>{user.Lifting_Date}</td>
                    <td>{user.Narration}</td>
                    <td>{user.Delivery_Type}</td>
                    <td>{user.gst_rate}</td>
                    <td>{user.gst_amt}</td>
                    <td>{user.tcs_rate}</td>
                    <td>{user.tcs_amt}</td>
                    {/* <td>{user.saledetailid}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </>
  );
};
export default TenderPurchase;
