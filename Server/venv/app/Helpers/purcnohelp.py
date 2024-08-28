
from flask import jsonify
from app import app, db
from sqlalchemy.exc import SQLAlchemyError 
from sqlalchemy import text
from flask import jsonify, request
import os



API_URL = os.getenv('API_URL')


@app.route(API_URL+'/purchno', methods=['GET'])
def purcno():
    try:
        CompanyCode = request.args.get('CompanyCode')
        MillCode = request.args.get('MillCode')

        #Tender_No = request.args.get('Tender_No')

        if  CompanyCode is None or MillCode is None:
            return jsonify({'error': 'Missing MillCode or CompanyCode parameter'}), 400
        # Start a database transaction
        with db.session.begin_nested():
            query = db.session.execute(text('''
               select Tender_No,Tender_DateConverted as Tender_Date,buyername as Party2,buyerpartyname as Party,Mill_Rate,Grade,Sale_Rate,Buyer_Quantal,DESPATCH,BALANCE,
                           tenderdoname as doname,Lifting_DateConverted as Lifting_Date,ID,tenderdetailid,tenderid,Delivery_Type,shiptoname,tenderdoshortname,season,Party_Bill_Rate  
                           from qrytenderdobalanceview 
                           where BALANCE!=0 and Company_Code= :CompanyCode and Mill_Code=:MillCode
            '''),{'CompanyCode':CompanyCode, 'MillCode':MillCode})

            result = query.fetchall()

        response = []
        for row in result:
            response.append({
                'Tender_No': row.Tender_No,
                'Tender_DateConverted': row.Tender_Date,
                'buyername': row.Party2,
                'buyerpartyname': row.Party,
                'Mill_Rate': row.Mill_Rate,
                'Grade':row.Grade,
                'Sale_Rate':row.Sale_Rate,
                'Buyer_Quantal':row.Buyer_Quantal,
                'DESPATCH':row.DESPATCH,
                'BALANCE':row.BALANCE,
                'tenderdoname':row.doname,
                'Lifting_DateConverted':row.Lifting_Date,
                'ID':row.ID,
                'tenderdetailid':row.tenderdetailid,
                'tenderid':row.tenderid,
                'Delivery_Type':row.Delivery_Type,
                'shiptoname':row.shiptoname,
                'tenderdoshortname':row.tenderdoshortname,
                'season':row.season,
                'Party_Bill_Rate':row.Party_Bill_Rate


            })

        return jsonify(response)

    except SQLAlchemyError as error:
        # Handle database errors
        print("Error fetching data:", error)
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    


@app.route(API_URL + "/getTenderNo_Data", methods=["GET"])
def getTenderNo_Data():
    try:
        Company_Code = request.args.get('CompanyCode')
        Tenderno = request.args.get('Tender_No')
        Year_Code = request.args.get('Year_Code')
        ID = request.args.get('ID')

        if not all([Company_Code, Tenderno, ID]):
            return jsonify({"error": "Missing required parameters"}), 400

        with db.session.begin_nested():
            # Execute query2 first
            query2 = db.session.execute(
                text('''
                    SELECT dbo.nt_1_companyparameters.SELF_AC, dbo.nt_1_accountmaster.accoid, dbo.nt_1_accountmaster.Ac_Name_E
                    FROM dbo.nt_1_companyparameters
                    INNER JOIN dbo.nt_1_accountmaster ON dbo.nt_1_companyparameters.Company_Code = dbo.nt_1_accountmaster.company_code 
                      AND dbo.nt_1_companyparameters.SELF_AC = dbo.nt_1_accountmaster.Ac_Code
                    WHERE dbo.nt_1_companyparameters.Year_Code = :Year_Code 
                      AND dbo.nt_1_companyparameters.Company_Code = :Company_Code
                '''),
                {'Year_Code': Year_Code, 'Company_Code': Company_Code}
            )
            SelfAc_data = [dict(row._mapping) for row in query2.fetchall()]
            selfacname=SelfAc_data[0].get('Ac_Name_E', None)
            selfac=SelfAc_data[0].get('SELF_AC', None)
            selfacid=SelfAc_data[0].get('accoid', None)
            
            
            # Now execute query1
            query = db.session.execute(
                text('''
                    SELECT Buyer, buyername, Buyer_Party, buyerpartyname, Voucher_By, voucherbyname, Grade, 
                           Buyer_Quantal AS Quantal, Packing, Bags, Excise_Rate, Mill_Rate, Sale_Rate, 
                           Tender_DO, tenderdoname, Broker, brokername, Commission_Rate AS CR, 
                           Delivery_Type AS DT, Payment_To, paymenttoname, gstratecode, gstratename, 
                           itemcode, itemname, tenderdetailid, ShipToname, shiptoid, ShipTo, season, 
                           Party_Bill_Rate, AutoPurchaseBill, buyerpartygststatecode, buyerpartystatename, 
                           buyerpartyid, buyerid, shiptoid, pt, ic, td, gstrate,
                           (case when Delivery_Type='DO' then Buyer else :selfac end) as Getpassno,
                           (case when Delivery_Type='DO' then buyerid else :selfacid end) as Getpassnoid,
                           (case when Delivery_Type='DO' then buyername else :selfacname end) as Getpassnoname  
                     
                    FROM qrytenderheaddetail
                    WHERE Company_Code = :Company_Code 
                      AND Tender_No = :Tender_No 
                      AND ID = :ID
                '''),
                 {'Company_Code': Company_Code, 'Tender_No': Tenderno, 'ID': ID,
                   'selfac': selfac,'selfacname':selfacname,'selfacid':selfacid}
      
                
            )

            result = query.fetchall()
            last_details_data = [dict(row._mapping) for row in result]

            response = {
                "last_details_data": last_details_data,
               
            }

            return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    
@app.route(API_URL + "/getTenderNo_DataByTenderdetailId", methods=["GET"])
def getTenderNo_DataByTenderdetailId():
    try:
       
        tenderdetailid = request.args.get('tenderdetailid')

        if not all([tenderdetailid]):
            return jsonify({"error": "Missing required parameters"}), 400

        with db.session.begin_nested():
            # Execute query2 first
            query2 = db.session.execute(
                text('''
                    SELECT dbo.nt_1_companyparameters.SELF_AC, dbo.nt_1_accountmaster.accoid, dbo.nt_1_accountmaster.Ac_Name_E
                    FROM dbo.nt_1_companyparameters
                    INNER JOIN dbo.nt_1_accountmaster ON dbo.nt_1_companyparameters.Company_Code = dbo.nt_1_accountmaster.company_code 
                      AND dbo.nt_1_companyparameters.SELF_AC = dbo.nt_1_accountmaster.Ac_Code
                    
                ''')
                
            )
            SelfAc_data = [dict(row._mapping) for row in query2.fetchall()]
            selfacname=SelfAc_data[0].get('Ac_Name_E', None)
            selfac=SelfAc_data[0].get('SELF_AC', None)
            selfacid=SelfAc_data[0].get('accoid', None)
            
            
            # Now execute query1
            query = db.session.execute(
                text('''
                    SELECT Buyer, buyername, Buyer_Party, buyerpartyname, Voucher_By, voucherbyname, Grade, 
                           Buyer_Quantal AS Quantal, Packing, Bags, Excise_Rate, Mill_Rate, Sale_Rate, 
                           Tender_DO, tenderdoname, Broker, brokername, Commission_Rate AS CR, 
                           Delivery_Type AS DT, Payment_To, paymenttoname, gstratecode, gstratename, 
                           itemcode, itemname, tenderdetailid, ShipToname, shiptoid, ShipTo, season, 
                           Party_Bill_Rate, AutoPurchaseBill, buyerpartygststatecode, buyerpartystatename, 
                           buyerpartyid, buyerid, shiptoid, pt, ic, td, gstrate,Tender_No,ID, mill_code, mc,millname,
                           (case when Delivery_Type='DO' then Buyer else :selfac end) as Getpassno,
                           (case when Delivery_Type='DO' then buyerid else :selfacid end) as Getpassnoid,
                           (case when Delivery_Type='DO' then buyername else :selfacname end) as Getpassnoname  
                     
                    FROM qrytenderheaddetail
                    WHERE  
                       tenderdetailid = :tenderdetailid
                '''),
                 {'tenderdetailid': tenderdetailid,
                   'selfac': selfac,'selfacname':selfacname,'selfacid':selfacid}
      
                
            )

            result = query.fetchall()
            last_details_data = [dict(row._mapping) for row in result]

            response = {
                "last_details_data": last_details_data,
               
            }

            return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

