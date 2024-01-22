using System;
using System.Collections.Generic;
using System.Text;
using System.Data;
//using System.Windows.Forms;
using System.Configuration;

namespace DataConnection
{
    public class SMSDL
    {
        Provinder provider = new Provinder();

        public static int ou_id = 0;
        public static int user_id = 0;
        public SMSDL()
        {

        }

        public DataTable GetListPrices(int inventory_item_id, int header_id, int org_id, string loaibao, string loaivobao)
        {
            string[] parameters = new string[] { "p_inventory_item_id", "p_header_id", "p_org_id", "p_loaibao_id", "p_loaivobao" };
            object[] values = new object[] { inventory_item_id, header_id, org_id, loaibao, loaivobao };
            DataTable dtList_Price = provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_price_lists_1", parameters, values);
            return dtList_Price;
        }
        public DataTable GetListPriceByID(int price_list_id)
        {
            return provider.Query(@"select plh.LIST_HEADER_ID, plh.list_NAME name
              from ht_price_list_headers plh
               where plh.LIST_HEADER_ID=" + price_list_id);
        }
        public DataTable GetOperand(int inventory_item_id,
                                    int header_id,
                                    int org_id,
                                    string loaibao_id,
                                    string loaivobao,
                                    string uom_code,
                                    int price_list_id)
        {
            string[] parameters = new string[] {"p_inventory_item_id",
                                            "p_header_id",
                                            "p_org_id",
                                            "p_loaibao_id",
                                            "p_loaivobao",
                                            "p_uom_code",
                                            "p_price_list_id"};
            object[] values = new object[] { inventory_item_id,
                                         header_id,
                                         org_id,
                                         loaibao_id,
                                         loaivobao,
                                         uom_code,
                                         price_list_id };
            return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_operand_1", parameters, values);
        }
        //ham lay gia them ORDER TYPE
        public DataTable GetOperand_2(int inventory_item_id,
                                   int header_id,
                                   int org_id,
                                   string loaibao_id,
                                   string loaivobao,
                                   string uom_code,
                                   int price_list_id,
                                   string order_type)
        {
            string[] parameters = new string[] {"p_inventory_item_id",
                                            "p_header_id",
                                            "p_org_id",
                                            "p_loaibao_id",
                                            "p_loaivobao",
                                            "p_uom_code",
                                            "p_price_list_id" ,
                                            "p_order_type"};
            object[] values = new object[] { inventory_item_id,
                                         header_id,
                                         org_id,
                                         loaibao_id,
                                         loaivobao,
                                         uom_code,
                                         price_list_id ,
                                         order_type};
            return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_operand_2", parameters, values);
        }
        public DataTable GetOperand_4(int inventory_item_id,
                                   int header_id,
                                   int org_id,
                                   string loaibao_id,
                                   string loaivobao,
                                   string uom_code,
                                   int price_list_id,
                                   string order_type,
                                   int checkpoint_id)
        {
            string[] parameters = new string[] {"p_inventory_item_id",
                                            "p_header_id",
                                            "p_org_id",
                                            "p_loaibao_id",
                                            "p_loaivobao",
                                            "p_uom_code",
                                            "p_price_list_id" ,
                                            "p_order_type",
                                            "p_checkpoint_id"};
            object[] values = new object[] { inventory_item_id,
                                         header_id,
                                         org_id,
                                         loaibao_id,
                                         loaivobao,
                                         uom_code,
                                         price_list_id ,
                                         order_type,
                                        checkpoint_id};
            return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_operand_2", parameters, values);
        }
        public DataTable GetOperand_3(int inventory_item_id,
                                  int header_id,
                                  int org_id,
                                  string loaibao_id,
                                  string loaivobao,
                                  string uom_code,
                                  int price_list_id,
                                  string order_type,
                                   int order_req_id)
        {
            string[] parameters = new string[] {"p_inventory_item_id",
                                            "p_header_id",
                                            "p_org_id",
                                            "p_loaibao_id",
                                            "p_loaivobao",
                                            "p_uom_code",
                                            "p_price_list_id",
                                            "p_order_type",
                                            "p_order_req_id"};
            object[] values = new object[] { inventory_item_id,
                                         header_id,
                                         org_id,
                                         loaibao_id,
                                         loaivobao,
                                         uom_code,
                                         price_list_id,
                                         order_type,
                                         order_req_id};
            return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_operand_2", parameters, values);
        }
        public DataTable GetAllUnitOfMeasures(int inventory_item_id)
        {
            //loai vo bao
            DataTable dtUnit_Of_Measure = provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_uom_by_item_id", "p_item_id", inventory_item_id);
            return dtUnit_Of_Measure;
        }
        public bool DeleteSO(int order_id, int user_id1) // thêm vào int userid1
        {
            //return provider.ExecSQL("DEV_WEBSALE_PKG.sp_delete_so","p_order_id",order_id);
            string[] parameters = new string[] { "p_order_id", "p_user_id" };
            object[] values = new object[] { order_id, user_id1 };
            return provider.ExecSQL("DEV_WEBSALE_PKG.sp_delete_so ", parameters, values);
        }
        public int GetCustomerID(string customer_number, string account_number) // thêm vào biến  string account_number
        {
            object cust_id = provider.ExecScalar(@"select hca.cust_account_id
                                                from hz_cust_accounts hca
                                                where hca.account_number='account_number'");
            if (cust_id != null)
            {
                return Convert.ToInt32(cust_id);
            }
            else
            {
                return 0;
            }
        }
        public double GetTaxCode(int inventory_item_id)
        {
            try
            {
                object tax = provider.CallFunction("DEV_WEBSALE_PKG.f_get_tax_code", "p_item_id", inventory_item_id, "NUMBER");
                return Convert.ToDouble(tax);
            }
            catch
            {
                return 0;
            }
        }
        public int GetItemTax(int item_id, int org_id, int trx_type_id)
        {
            try
            {
                //DEV_WEBSALE_PKG.F_GET_TAX_RATE(item_id, org_id,legal_id,trx_type_id)
                int legal_id = Xntt_legal();
                string[] parameters = new string[] {"P_ITEM_ID",
                                            "P_ORG_ID",
                                            "P_LEDGER_ID",
                                            "P_TRX_TYPE_ID"
                                            };
                object[] values = new object[] { item_id, org_id, legal_id, trx_type_id };
                object num = provider.CallFunction("DEV_WEBSALE_PKG.F_GET_TAX_RATE", parameters, values, "NUMBER");
                return Convert.ToInt32(num);
            }
            catch
            {
                return 0;
            }
        }
        //LAY TYPE CUA HOP DONG : CO PHAI XUAT KHAU KO
        public string GetSAType(int contract_id)
        {
            //try
            //{
            //    string[] parameters = new string[] { "contract_id" };
            //    object[] values = new object[] { contract_id };
            //    object num = provider.CallFunction("DEV_WEBSALE_PKG.f_get_sa_type", parameters, values, "VARCHAR");
            //    return num.ToString();
            //}
            //catch
            //{
            //    return "";
            //}

            // WS_999
            return "";
        }
        public int Xntt_legal()
        {
            //DEV_WEBSALE_PKG.F_GET_TAX_RATE(item_id, org_id,legal_id,trx_type_id)
            string[] parameters = new string[] { };
            object[] values = new object[] { };
            object num = provider.CallFunction("dev_pubforms_pkg.xntt_legal", parameters, values, "NUMBER");
            return Convert.ToInt32(num);
        }

        public int GetCheckPointID(string name)
        {
            try
            {
                object checkpointID = provider.CallFunction("DEV_WEBSALE_PKG.f_get_checkpoint_id", "p_checkpoint_name", name, "VARCHAR");
                return Convert.ToInt32(checkpointID.ToString());
            }
            catch
            {
                return 0;
            }
        }
        public int GetAreaID(int checkpoint_id)
        {
            try
            {
                object num = provider.ExecScalar(@"select chk.area_id 
                                                from checkpoints chk
                                                where chk.checkpoint_id=" + checkpoint_id);
                return Convert.ToInt32(num);
            }
            catch
            {
                return 0;
            }
        }
        public string GetTypeSA(int header_id)
        {
            try
            {
                object num = provider.ExecScalar(@"select nvl(attribute2,'N') from oe_blanket_headers_all a
                                            where a.header_id  =" + header_id);
                return num.ToString();
            }
            catch
            {
                return "";
            }
        }
        public DataTable GetArea(int customer_id, int ou_id1) // thêm vào int oui_d1
        {
            /*(@"select are.name,are.area_id
                                    from areas are,
                                         customer_area cust_a
                                    where are.area_id=cust_a.area_id
                                          and are.active_flag='Y'
                                          and cust_a.customer_id="+customer_id);*/
            /*ou_id = Convert.ToInt32(Session["ou_id"]);
            return provider.Query(@"select distinct a.name ,a.area_id
                                      from areas a, customer_checkpoint b, checkpoints c
                                     where c.checkpoint_id = b.checkpoint_id
                                       and c.area_id = a.area_id
                                       and a.active_flag = 'Y'
                                       and c.active_flag = 'Y'
                                       and to_date(nvl(a.start_date,sysdate - 1/4), 'DD/MM/RRRR') <= to_date(sysdate - 1/4, 'DD/MM/RRRR')
                                       and to_date(nvl(a.end_date,sysdate - 1/4), 'DD/MM/RRRR') >= to_date(sysdate - 1/4, 'DD/MM/RRRR')
                                       and b.customer_id =" + customer_id + " and a.org_id = " + ou_id 
                                 );*/
            ou_id = ou_id1; // HM_WS_001 
            string[] Param = new string[] { "p_customer_id", "p_ou_id" };
            object[] Val = new object[] { customer_id, ou_id };
            return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_order_area ", Param, Val);
        }

        public DataTable GetCheckpointByAreaID(int area_id)
        {
            /*(@"select chk.name,chk.checkpoint_id
                                    from checkpoints chk
                                    where chk.active_flag='Y'
                                          and chk.area_id="+area_id);*/
            return provider.Query(@"select chk.name,chk.checkpoint_id
                                from checkpoints chk
                                where chk.active_flag='Y'
                                      and chk.area_id=" + area_id);
        }
        /// <summary>
        /// them ket dieu kien voi khach hang
        /// </summary>
        /// <param name="area_id"></param>
        /// <param name="customer_id"></param>
        /// <returns></returns>
        public DataTable GetCheckpointByAreaID_2(int area_id, int customer_id)
        {
            /*(@"select chk.name, chk.checkpoint_id
                                      from checkpoints chk
                                           ,customer_area a
                                     where chk.active_flag = 'Y'
                                     and   chk.area_id = chk.area_id                                   
                                       and a.customer_id = " + customer_id
                                       +" and chk.area_id = " + area_id);*/
            return provider.Query(@"select c.name,c.checkpoint_id
                              from areas a, customer_checkpoint b, checkpoints c
                             where c.checkpoint_id = b.checkpoint_id
                               and c.area_id = a.area_id
                               and a.active_flag = 'Y'
                               and c.active_flag = 'Y'                              
                               and b.customer_id = " + customer_id
                                   + " and a.area_id = " + area_id
                                 + " order by (select count(SO.CHECKPOINT_ID) from sales_orders so where so.status='RECEIVED' and so.customer_id = " + customer_id + " and so.checkpoint_id = c.checkpoint_id) DESC");
        }
        public int CheckStatusSO(int customer_id, int blanket_id, int inventory_item_id)
        {
            string[] parameters = new string[] { "p_cust_id", "p_header_id", "p_item_id" };
            object[] values = new object[] { customer_id, blanket_id, inventory_item_id };
            object num = 0; // WS_999 provider.CallFunction("DEV_WEBSALE_PKG.f_checkstatusso", parameters, values, "NUMBER");
            return Convert.ToInt32(num);
        }
        public DataTable GetReceiver(int customer_id)
        {
            return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_receiver", "p_cust_id", customer_id);
        }

        public string GetNearVehicleCode(int customer_id)
        {
            try
            {
                return provider.ExecScalar("select vehicle_code from (select vehicle_code from sales_orders where status <> 'VOIDED' and customer_id=" + customer_id + " order by order_date desc) where rownum=1").ToString();
            }
            catch
            {
                return "";
            }
        }
        public string GetNearDriverName(int customer_id)
        {
            try
            {
                return provider.ExecScalar("select driver_name from (select driver_name from sales_orders where status <> 'VOIDED' and customer_id=" + customer_id + " order by order_date desc) where rownum=1").ToString();
            }
            catch
            {
                return "";
            }
        }
        public DataTable GetAllCustomers(int user_id, int ou_id1) // thêm vào ou id1
        {
            //  ou_id = Convert.ToInt32(Session["ou_id"]); // HM_WS_001 
            ou_id = ou_id1;
            string[] Param = new string[] { "p_user_id", "p_ou_id" };
            object[] Val = new object[] { user_id, ou_id };
            return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_customers ", Param, Val);
        }
        public VCCustomer GetCustomerInfo(int user_id, int cust_id, int ou_id1) // thêm vào int ou_id1
        {
            VCCustomer res = new VCCustomer();
            res.customer_id = cust_id;
            string[] addParam = new string[] { "p_cust_id", "p_type" };
            object[] addVal_Bill_To = new object[] { cust_id, "BILL_TO" };
            DataTable addressTable = provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_address", addParam, addVal_Bill_To);
            res.billtolocation = addressTable;
            if (addressTable.Rows.Count > 0)
            {
                res.customer_number = addressTable.Rows[0]["account_number"].ToString();
                res.customer_name = addressTable.Rows[0]["customer_name"].ToString();
                res.invoice_to_name = addressTable.Rows[0]["address"].ToString();
            }
            object[] addVal_Ship_To = new object[] { cust_id, "SHIP_TO" };
            DataTable tbl_ship_to = provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_address", addParam, addVal_Ship_To);
            res.shiptolocation = tbl_ship_to;
            if (tbl_ship_to.Rows.Count > 0)
                res.ship_to_name = tbl_ship_to.Rows[0]["address"].ToString();
            //   res.bookAmount = 519995454.545455;
            string x = provider.CallFunction("DEV_WEBSALE_PKG.f_get_amount_booked", "p_cust_id", cust_id, "NUMBER").ToString();
            res.bookAmount = Convert.ToDouble(provider.CallFunction("DEV_WEBSALE_PKG.f_get_amount_booked", "p_cust_id", cust_id, "NUMBER").ToString());
            res.receivedAmount = Convert.ToDouble(provider.CallFunction("DEV_WEBSALE_PKG.f_get_amount_received", "p_cust_id", cust_id, "NUMBER").ToString());
            res.saleperson = provider.CallFunction("DEV_WEBSALE_PKG.f_get_sale_person", "p_cust_id", cust_id, "VARCHAR").ToString(); ;
            //công nợ hiện thời
            string[] parameters = new string[] { "p_org_id", "p_cust_id" };
            object[] values = new object[] { null, cust_id };
            res.currentDebtAmount = Convert.ToDouble(provider.CallFunction("DEV_WEBSALE_PKG.f_get_debt", parameters, values, "NUMBER").ToString());
            // ou_id = Convert.ToInt32(Session["ou_id"]);
            ou_id = ou_id1;// HM_WS_001 
            string[] contractParam = new string[] { "p_user_id", "p_cust_id", "p_ou_id" };
            object[] contractVal = new object[] { user_id, cust_id, ou_id };
            res.contracts = provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_contracts", contractParam, contractVal);
            res.contracts_ntm = provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_contracts_ntm", contractParam, contractVal);

            string[] ckParam = new string[] { "p_cust_id", "p_ou_id" };
            object[] ckVal = new object[] { cust_id, ou_id };
            res.checkpoints = provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_checkpoints", ckParam, ckVal);
            res.receiver = GetReceiver(cust_id);
            //vehicle prevent
            DataTable dtVehicle_Prevent = provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_vehicle_prevent", "p_cust_id", cust_id);
            string listPrevent = "";
            for (int i = 0; i < dtVehicle_Prevent.Rows.Count; i++)
            {
                listPrevent += dtVehicle_Prevent.Rows[i]["vehicle_code"].ToString() + ",";
            }
            res.list_vehicle_prevent = listPrevent;
            return res;
        }
        public Contract GetContractInfo(int contract_id, string item_type)
        {
            Contract res = new Contract();
            res.contract_id = contract_id;
            string[] paramItem = new string[] { "p_agreement_id", "p_item_type" };
            object[] valItem = new object[] { contract_id, item_type };
            DataTable dtItem = provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_items", paramItem, valItem);
            res.items = dtItem;
            return res;
        }
        //lay mat hang, co kiem tra dieu kien rang buoc
        public Contract GetContractInfo_2(int area_id, int customer_id, int org_id, int contract_id, string item_type)
        {
            Contract res = new Contract();
            res.contract_id = contract_id;
            string[] paramItem = new string[] { "p_area_id", "p_customer_id", "p_org_id", "p_agreement_id", "p_item_type" };
            object[] valItem = new object[] { area_id, customer_id, org_id, contract_id, item_type };
            DataTable dtItem = provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_item_list", paramItem, valItem);
            res.items = dtItem;
            return res;
        }
        public Contract GetHiredContractInfo(int area_id, int customer_id, int org_id, int contract_id, string item_type) // TD_WS_017
        {
            Contract res = new Contract();
            res.contract_id = contract_id;
            string[] paramItem = new string[] { "p_area_id", "p_customer_id", "p_org_id", "p_agreement_id", "p_item_type" };
            object[] valItem = new object[] { area_id, customer_id, org_id, contract_id, item_type };
            DataTable dtItem = provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_hired_item_list", paramItem, valItem);
            res.items = dtItem;
            return res;
        }
        public DataTable GetWareHouse(int inventory_item_id, int user_id)
        {
            string[] paramItem = new string[] { "p_item_id", "p_user_id" };
            object[] valItem = new object[] { inventory_item_id, user_id };
            return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_ship_from_org", paramItem, valItem);
        }
        public DataTable GetUnitOfMeasures(int contract_id, int inventory_item_id)
        {
            //string[] parameters = new string[] { "p_agreement_id", "p_product_id" };
            //object[] values = new object[] { contract_id, inventory_item_id.ToString() };
            //return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_unit_of_measure", parameters, values);
            DataTable dtUnit_Of_Measure = provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_uom_by_item_id", "p_item_id", inventory_item_id);
            return dtUnit_Of_Measure;
        }
        public DataTable GetListPrices(int contract_id, string product_id, string uom_code)
        {
            string[] parameters = new string[] { "p_agreement_id", "p_product_id", "p_uom_code" };
            object[] values = new object[] { contract_id, product_id, uom_code };
            return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_unit_price", parameters, values);
        }
        public DataTable Get_WareHouse_Quantity(int req_id, int item_id, string uom)
        {
            string[] parameters = new string[] { "p_req_id", "p_item_id", "p_uom" };
            object[] values = new object[] { req_id, item_id, uom };
            return provider.GetDataTable("DEV_WEBSALE_PKG.get_warehouse_quantity", parameters, values);
        }
        public DataTable GetTransportMethod(int checkpoint_id)
        {
            return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_transport_method", "p_checkpoint_id", checkpoint_id);
        }
        public DataTable GetPackTypes(int inventory_item_id)
        {
            try
            {
                return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_loaivobao", "p_item_id", inventory_item_id);
            }
            catch
            {
                DataTable dt = new DataTable();
                dt.Columns.Add("pack_type_id");
                dt.Columns.Add("pack_type_name");
                return dt;
            }
        }
        public DataTable GetPackTypesOrg(int inventory_item_id, int org_id)
        {
            try
            {
                string[] parameters = new string[] {"p_item_id",
                                   "p_org_id"};
                object[] values = new object[] {inventory_item_id,
                                org_id};

                return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_loaivobao_nguon", parameters, values);
            }
            catch
            {
                DataTable dt = new DataTable();
                dt.Columns.Add("pack_type_id");
                dt.Columns.Add("pack_type_name");
                return dt;
            }
        }
        public DataTable GetPackTypesAll(int area_id, int customer_id, int org_id, int inventory_item_id)
        {
            try
            {
                string[] parameters = new string[] { "p_area_id", "p_customer_id", "p_org_id", "p_item_id" };
                object[] values = new object[] { area_id, customer_id, org_id, inventory_item_id };

                return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_loaivobao_all", parameters, values);
            }
            catch
            {
                DataTable dt = new DataTable();
                dt.Columns.Add("pack_type_id");
                dt.Columns.Add("pack_type_name");
                return dt;
            }
        }
        public double CalculateDiscount(SaleOrder so)
        {
            //string[] parameters = new string[] {"p_customer_id",
            //                           "p_ship_from_org_id",
            //                           "p_checkpoint_id",
            //                           "p_transport_method_id",
            //                           "p_inventory_item_id",
            //                           "p_order_date",
            //                           "p_uom_code",
            //                           "p_order_quantity"};
            //object[] values = new object[] {so.customer_id,
            //                        so.ship_from_org_id,
            //                        so.checkpoint_id,
            //                        so.transport_method_id,
            //                        so.inventory_item_id,
            //                        so.order_date,
            //                        so.uom_code,
            //                        so.quantity};
            //object discount = provider.CallFunction("dev_omforms_pkg.CALCULATE_DISCOUNT", parameters, values, "NUMBER");
            string[] parameters = new string[] {"p_discount_type",
                                   "p_customer_id",
                                   "p_org_id",
                                   "p_order_type",
                                   "p_contract_id",
                                   "p_shippoint_id",
                                   "p_area_id",
                                   "p_checkpoint_id",
                                   "p_transport_method_code",
                                   "p_item_id",
                                   "p_order_date",
                                   "p_uom_code",
                                   "p_quantity"};
            object[] values = new object[] {"DRAFT_DISCOUNT",
                                so.customer_id,
                                so.ship_from_org_id,
                                so.order_type, //
                                so.blanket_id, //
                                so.shippoint_id, //
                                so.area_id, //
                                so.checkpoint_id, //
                                so.transport_method_id.ToString(), //
                                so.inventory_item_id, //
                                so.order_date, //
                                so.uom_code,
                                so.quantity};
            object discount = provider.CallFunction("dev_om_fin_pkg.calculate_discount", parameters, values, "NUMBER");
            return Convert.ToDouble(discount.ToString());
        }
        public int GetPriceListID(int blanket_id, int inventory_item_id, string uom_code)
        {
            string[] parameters = new string[] { "p_agreement_id", "p_product_id", "p_uom_code" };
            object[] values = new object[] { blanket_id, inventory_item_id.ToString(), uom_code };
            DataTable dtUnit_Price = provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_unit_price", parameters, values);
            try
            {
                return Convert.ToInt32(dtUnit_Price.Rows[0]["LIST_HEADER_ID"].ToString());
            }
            catch
            {
                return -1;
            }
        }
        public double GetFreightFee(int inventory_item_id, string uom_code, int blanket_id, double quantity)
        {
            string[] paramShip = new string[] { "p_item_id", "p_uom_code", "p_blanket_id", "p_quantity" };
            object[] valShip = new object[] { inventory_item_id, uom_code, blanket_id, quantity };
            object fee = 0; // WS_999 provider.CallFunction("DEV_WEBSALE_PKG.f_cal_freight", paramShip, valShip, "NUMBER");
            return Convert.ToDouble(fee);
        }
        public void CalculateFreight(SaleOrder so)
        {
            string[] paramShip = new string[] { "p_item_id", "p_uom_code", "p_blanket_id", "p_quantity", "p_delivery_code" };
            object[] valShip = new object[] { so.inventory_item_id,
                                          so.uom_code,
                                          so.blanket_id,
                                          so.quantity,
                                          so.delivery_code};
            provider.ExecSQL("DEV_WEBSALE_PKG.sp_cal_freight", paramShip, valShip);
        }
        public string GetOrderItem(int inventory_item_id, int organization_id)
        {
            string[] paramOrderItem = new string[] { "p_item_id", "p_org_id" };
            object[] valOrderItem = new object[] { inventory_item_id, organization_id };
            string order_item = provider.CallFunction("DEV_WEBSALE_PKG.f_get_order_item", paramOrderItem, valOrderItem, "VARCHAR").ToString();
            return order_item;
        }
        public double CreditLimit(int customer_id, int inventory_item_id, int header_id, int ou_id1) // thêm vao ou_id1;
        {
            //hạn mức công nợ
            //  ou_id = Convert.ToInt32(Session["ou_id"]); // HM_WS_001 
            ou_id = ou_id1;
            string[] paramCredit = new string[] { "p_cust_id", "p_item_id", "p_header_id", "p_ou_id" };
            object[] valCredit = new object[] { customer_id, inventory_item_id, header_id, ou_id };
            double credit_limit = Convert.ToDouble(provider.CallFunction("DEV_WEBSALE_PKG.f_get_credit_limit_1", paramCredit, valCredit, "NUMBER").ToString());
            return credit_limit;
        }
        public int CheckHanThanhToan(int customer_id, int contract_id, int item_id)
        {
            //kiem tra han thời hạn thanh toán 
            string[] paramCredit = new string[] { "p_customer_id", "p_contract_id", "p_item_id" };
            object[] valCredit = new object[] { customer_id, contract_id, item_id };
            int res = Convert.ToInt32(provider.CallFunction("DEV_WEBSALE_PKG.Check_payment_term", paramCredit, valCredit, "NUMBER").ToString());
            return res;
        }
        public double GetCurrentDebtAmount(int ship_from_org_id, int customer_id, int blanket_id, int inventory_item_id)
        {
            //công nợ hiện thời
            string[] paramDebt = new string[] { "p_org_id", "p_cust_id", "p_blanket_id", "p_inventory_item_id" };
            object[] valDebt = new object[] { null, customer_id, blanket_id, inventory_item_id };
            double debtAmount = Convert.ToDouble(provider.CallFunction("DEV_WEBSALE_PKG.f_get_debt1", paramDebt, valDebt, "NUMBER"));
            return debtAmount;
        }
        public string GetTypeSPM(int item_id)
        {
            string res = provider.CallFunction("dev_pubforms_pkg.IS_SPM", "p_item_id", item_id, "VARCHAR").ToString();
            return res;
        }
        public string Create_SO(SaleOrder so)
        {
            var p_PARENT_DELIVERY_CODE = "";
            var p_cancel_delivery_code = "";
            var p_FREIGHT_AMOUNT = 1;
            var p_order_id = 1;
            var p_delivery_code = "";
            var p_RECEIVE_METHOD = 1;
            var p_delivery_date = DateTime.Now;
            var p_bsd_id = 1;

            string[] parameters = new string[] {"p_STATUS",
                                            "p_STATUS_DESCRIPTION",
                                            "p_ORDER_QUANTITY",
                                            "p_DISCOUNT",
                                            "p_UNIT_PRICE",
                                            "p_ORDER_AMOUNT",
                                            "p_PROMO_FLAG",
                                            "p_DRIVER_NAME",
                                            "p_VEHICLE_CODE",
                                            "p_RECEIVER",
                                            "p_DESCRIPTION",
                                            "p_BLANKET_ID",
                                            "p_SHIP_FROM_ORG_ID",
                                            "p_SHIP_TO_ORG_ID",
                                            "p_INVOICE_TO_ORG_ID",
                                            "p_INVENTORY_ITEM_ID",
                                            "p_TRANSPORT_METHOD_ID",
                                            "p_USER_ID",
                                            "p_PRICE_LIST_ID",
                                            "p_CUSTOMER_ID",
                                            "p_UOM_CODE",
                                            "p_CURRENCY_CODE",
                                            "p_CHECKPOINT_ID",
                                            "p_ORDER_TYPE",
                                            "p_ORDER_ITEM",
                                            "p_SOURCE_LINE_ID",


                                           "p_PARENT_DELIVERY_CODE",
                                            "p_cancel_delivery_code",
                                            "p_FREIGHT_AMOUNT",
                                            "p_RECEIVE_METHOD",



                                            "p_PACK_TYPE",
                                            "p_BAG_TYPE",
                                            "p_RECEIVER_ID",
                                            
                                            //"p_order_id",
                                            //"p_delivery_code",
                                            "p_delivery_date",


                                            "p_DOC_NUM", // WS_004
                                            "p_ORDER_DATE", // WS_004
                                            "p_LOT_NUMBER", // TD_WS_003
                                            "p_DOC_SERIES", // TD_WS_003
                                            "p_DOC_TEMPLATE", // TD_WS_003
                                            "p_PRINT_STATUS", // BIS_WS_002
                                            "p_LOCATION_CODE", // BIS_WS_002
                                            "p_DRIVER_INFO", // BIS_WS_002
                                            "p_EX_CUSTOMER_ID", // BIS_WS_002
                                            "p_EX_UNIT_PRICE", // BIS_WS_002
                                            "p_TAX_AMOUNT", // BIS_WS_002
                                            "p_SHIPPOINT_ID", // BIS_WS_002
                                            "p_MOOC_CODE",// BIS_WS_002
                                            "p_AREA_ID", // BIS_WS_002
                                            "p_production_line",// -- BTS_WS_001
                                            "p_branch_id", //Duca anh moi them vao       
                                            "p_bsd_id"
                                            };
            object[] values = new object[] {
                                        so.status != null ? so.status : "",
                                        so.status_description != null ? so.status_description : "",
                                        so.quantity,
                                        so.discount,
                                        so.unit_price,
                                        so.amount,
                                        so.promo_flag,
                                        so.driver_name,
                                        so.vehicle_code,
                                        so.receiver_name,
                                        so.description,
                                        so.blanket_id,
                                        so.ship_from_org_id,
                                        so.ship_to_org_id,
                                        so.invoice_to_org_id,
                                        so.inventory_item_id,
                                        so.transport_method_id,
                                        so.user_id,
                                        so.price_list_id,
                                        so.customer_id,
                                        so.uom_code,
                                        so.currency_code,
                                        so.checkpoint_id,
                                        so.order_type,
                                        so.order_item,
                                        so.source_document_line_id,

                                        null,
                                        null,
                                        null,
                                        null,

                                        so.pack_type,
                                        so.bag_type,
                                        so.receiver_id,

                                        null,
                                        null,
                                        null,

                                        so.doc_num, // WS_004
                                        so.order_date, // WS_004
                                        so.lot_number,
                                        so.doc_series,
                                        so.doc_template,
                                        so.print_status, // BIS_WS_002
                                        so.location_code, // BIS_WS_002
                                        so.driver_info, // BIS_WS_002
                                        so.ex_customer_id, // BIS_WS_002
                                        so.ex_unit_price, // BIS_WS_002
                                        so.tax_amount, // BIS_WS_002
                                        so.shippoint_id, // BIS_WS_002
                                        so.mooc_code,
                                        so.area_id,
                                        so.production_line,
                                        so.branch_id,
                                        null
                                        };
            try
            {
                //return provider.ExecSQL_SO_DCode("DEV_APP_PKG.app_sp_insert_so", parameters, values).ToString();
                var a = provider.ExecSQL_SO_DCode("DEV_WEBSALE_PKG.sp_insert_so", parameters, values);
                return a.ToString();
            }
            catch (Exception ex)
            {
                return "CreateSo Error";
            }
        }
        public double GetMaxQuantity(int header_id, int item_id, string uom_code)
        {
            string[] parameters = new string[] { "p_header_id", "p_item_id", "p_uom_code" };
            object[] values = new object[] { header_id, item_id, uom_code };
            object res = provider.CallFunction("DEV_WEBSALE_PKG.f_get_max_quantity", parameters, values, "NUMBER");
            return Convert.ToDouble(res);
        }
        public bool CheckUser(int user_id)
        {
            object num = provider.CallFunction("DEV_WEBSALE_PKG.f_checknhanvien", "p_user_id", user_id, "NUMBER");
            if (Convert.ToInt32(num) == 1)
                return true;
            else
                return false;
        }
        public bool CheckExistVehicleCode(int customer_id, string vehicle_code)
        {
            string[] parameters = new string[] { "p_cust_id", "p_vehicle_code" };
            object[] values = new object[] { customer_id, vehicle_code };
            object num = provider.CallFunction("DEV_WEBSALE_PKG.f_checkvehiclecode", parameters, values, "NUMBER");
            return false;
            //if (Convert.ToInt32(num) >0 )
            //    return true;
            //else
            //    return false;
        }
        public DataTable GetLoaiBao(string loaivobao)
        {
            return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_loaibao", "p_loaivobao", loaivobao);
        }
        public int CheckPaymentTerm(int customer_id, int blanket_id)
        {
            string[] parameters = new string[] { "p_cust_id", "p_blanket_id" };
            object[] values = new object[] { customer_id, blanket_id };
            object num = provider.CallFunction("DEV_WEBSALE_PKG.f_checkpaymentterm", parameters, values, "NUMBER");
            return Convert.ToInt32(num);
        }
        //------------Trung them 04-04-2012
        public double BonusLimit(int p_cust_id, int p_item_id, double p_unit_price, int p_header_id, int p_order_id)
        {
            //Luong KM con lai
            string[] paramDET = new string[] { "p_cust_id", "p_item_id", "p_unit_price", "p_header_id", "p_order_id" };
            object[] valDET = new object[] { p_cust_id, p_item_id, p_unit_price, p_header_id, p_order_id };
            object bonus_limit = provider.CallFunction("DEV_WEBSALE_PKG.f_get_promo_allow_reg_value", paramDET, valDET, "NUMBER");
            return Convert.ToDouble(bonus_limit);
        }
        //--Lay ten tai xe tuong duong tu so xe
        public string GetDriverNameVehicle(int customer_id, string vehicle_code)
        {
            try
            {
                return provider.ExecScalar("select driver_name from (select driver_name from sales_orders where status<>'VOIDED' and customer_id=" + customer_id + " and vehicle_code='" + vehicle_code + "' order by order_date desc) where rownum=1").ToString();
            }
            catch
            {
                return "";
            }
        }
        public DataTable GetAllItems() // WS_006
        {
            return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_all_items");
        }
        public int CheckDuplicateSO(SaleOrder so)
        {
            string[] parameters01 = new string[] { "p_customer_id", "p_item_id", "p_order_quantity", "p_checkpoint_id", "p_transport_method_id" };
            object[] values01 = new object[] { so.customer_id, so.inventory_item_id, so.quantity, so.checkpoint_id, so.transport_method_id };
            object num = provider.CallFunction("DEV_WEBSALE_PKG.f_check_duplicate", parameters01, values01, "NUMBER");
            return Convert.ToInt32(num);


        }
        public DataTable GetPriceList(int item_id,
                                      int org_id,
                                      int customer_id,
                                      int contract_id,
                                      int ship_org_id,
                                      string uom_code,
                                      int checkpoint_id,
                                      int shippoint_id,
                                      double quantity,
                                      string order_type) // TD_WS_004
        {
            string[] parameters = new string[] {"p_item_id",
                                            "p_org_id",
                                            "p_customer_id",
                                            "p_contract_id",
                                            "p_uom_code",
                                            "p_checkpoint_id",
                                            "p_shippoint_id",
                                            "p_quantity" ,
                                            "p_order_type"};
            object[] values = new object[] { item_id,
                                         org_id,
                                         customer_id,
                                         contract_id,
                                         uom_code,
                                         checkpoint_id,
                                         shippoint_id,
                                         quantity ,
                                         order_type};
            return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_price_list_BIS", parameters, values);
        }
        public DataTable GetPriceList(int item_id,
                                      int org_id,
                                      int customer_id,
                                      int contract_id,
                                      int ship_org_id,
                                      string uom_code,
                                      int checkpoint_id,
                                      double quantity,
                                      string order_type) // TD_WS_004
        {
            string[] parameters = new string[] {"p_item_id",
                                            "p_org_id",
                                            "p_customer_id",
                                            "p_contract_id",
                                            "p_uom_code",
                                            "p_checkpoint_id",
                                            "p_quantity" ,
                                            "p_order_type"};
            object[] values = new object[] { item_id,
                                         org_id,
                                         customer_id,
                                         contract_id,
                                         uom_code,
                                         checkpoint_id,
                                         quantity ,
                                         order_type};
            return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_price_list_TD", parameters, values);
        }
        public string GetItemSOCategory(int item_id) // TD_WS_008
        {
            string res = provider.CallFunction("DEV_WEBSALE_PKG.f_get_item_so_category", "p_item_id", item_id, "VARCHAR").ToString();
            return res;
        }
        public DataTable GetDrivers(int customer_id) // TD_WS_013
        {
            string[] parameters = new string[] { "p_customer_id" };
            object[] values = new object[] { customer_id };
            return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_drivers", parameters, values);
        }
        public DataTable SearchDrivers(int customer_id, string search_key, int ou_id1) // TD_WS_013
        {
            ou_id = ou_id1; // HM_WS_001 
            string[] parameters = new string[] { "p_customer_id", "p_search_key", "p_ou_id" };
            object[] values = new object[] { customer_id, search_key, ou_id };
            return provider.GetDataTable("DEV_WEBSALE_PKG.sp_search_drivers", parameters, values);
        }
        public string GetDocSeries() // TD_WS_003
        {
            string res = provider.ExecScalar("select DEV_WEBSALE_PKG.f_get_doc_series from dual").ToString();
            return res;
        }
        public string GetDocSeries(int shippoint_id) // TD_WS_003
        {
            string[] parameters = new string[] { "p_shippoint_id" };
            object[] values = new object[] { shippoint_id };
            string res = provider.CallFunction("DEV_WEBSALE_PKG.f_get_doc_series", parameters, values, "VARCHAR").ToString();
            return res;
        }
        public string GetDocTemplate() // TD_WS_003
        {
            string res = provider.ExecScalar("select DEV_WEBSALE_PKG.f_get_doc_template from dual").ToString();
            return res;
        }
        public string GetLotNumber(int customer_id, int item_id) // TD_WS_003
        {
            string[] parameters01 = new string[] { "p_customer_id", "p_item_id" };
            object[] values01 = new object[] { customer_id, item_id };
            string res = provider.CallFunction("DEV_WEBSALE_PKG.f_get_lot_number", parameters01, values01, "VARCHAR").ToString();
            return res;
        }

        public string GetOrderDate() // TD_WS_015
        {

            string res = provider.ExecScalar("select DEV_WEBSALE_PKG.f_get_order_date from dual").ToString();
            return res;
        }
        public int CheckDocNum(string doc_num, string doc_series, string doc_template, int order_id) // TD_WS_012
        {
            string[] parameters01 = new string[] { "p_doc_num", "p_doc_series", "p_doc_template", "p_order_id" };
            object[] values01 = new object[] { doc_num, doc_series, doc_template, order_id };
            object num = provider.CallFunction("DEV_WEBSALE_PKG.f_check_doc_num", parameters01, values01, "NUMBER");
            //  MessageBox.Show("Thành công") ;

            return Convert.ToInt32(num);
        }
        public string GetAutoDocNum(string doc_series, string doc_template) // TD_WS_020
        {
            string[] parameters01 = new string[] { "p_doc_series", "p_doc_template" };
            object[] values01 = new object[] { doc_series, doc_template };
            string num = provider.CallFunction("DEV_WEBSALE_PKG.f_auto_doc_num", parameters01, values01, "VARCHAR").ToString();
            return num;
        }
        public string GetAutoDocNum2(int user_id, int shippoint_id, string doc_series, string doc_template) // TD_WS_020
        {
            string[] parameters01 = new string[] { "p_user_id", "p_shippoint_id", "p_doc_series", "p_doc_template" };
            object[] values01 = new object[] { user_id, shippoint_id, doc_series, doc_template };
            string num = provider.CallFunction("DEV_WEBSALE_PKG.f_auto_doc_num2", parameters01, values01, "VARCHAR").ToString();
            return num;
        }
        public DataTable GetShippoint(int customer_id, int user_id, int ou_id1) // BIS_WS_001
        {
            ou_id = ou_id1; // HM_WS_001 
            string[] parameters = new string[] { "p_customer_id", "p_user_id", "p_ou_id" };
            object[] values = new object[] { customer_id, user_id, ou_id };
            return provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_shippoint_list", parameters, values);
        }
        public string GetLocationCode(int shippoint_id, int customer_id, int area_id)
        {
            string[] parameters01 = new string[] { "p_shippoint_id", "p_customer_id", "p_area_id" };
            object[] values01 = new object[] { shippoint_id, customer_id, area_id };
            string num = provider.CallFunction("DEV_WEBSALE_PKG.f_get_location_code", parameters01, values01, "VARCHAR").ToString();
            return num;
        }
        public int CheckCreditLimit(int customer_id, int inventory_item_id, int header_id, double quantity, double price, int ou_id1)
        {
            ou_id = ou_id1; // HM_WS_001 
            string[] parameters01 = new string[] { "p_cust_id", "p_item_id", "p_header_id", "p_quantity", "p_price", "p_ou_id" };
            object[] values01 = new object[] { customer_id, inventory_item_id, header_id, quantity, price, ou_id };
            object num = provider.CallFunction("DEV_WEBSALE_PKG.f_check_credit_limit", parameters01, values01, "NUMBER");
            return Convert.ToInt32(num);
        }
        public string GetOrderDescription(int item_id, int order_type, string ex_text)
        {
            string[] parameters01 = new string[] { "p_item_id", "p_order_type", "p_text" };
            object[] values01 = new object[] { item_id, order_type, ex_text };
            string num = provider.CallFunction("DEV_WEBSALE_PKG.f_get_so_description", parameters01, values01, "VARCHAR").ToString();
            return num;
        }
        public string GetVehicleNote(int customer_id, string vehicle_code, int user_id1, int ou_id1)
        {
            ou_id = ou_id1;// Convert.ToInt32(Session["ou_id"]); // HM_WS_001
            user_id = user_id1;// Convert.ToInt32(Session["user_id"]); // HM_WS_001
            string[] parameters01 = new string[] { "p_customer_id", "p_vehicle_code", "p_user_id", "p_ou_id" };
            object[] values01 = new object[] { customer_id, vehicle_code, user_id, ou_id };
            string num = provider.CallFunction("DEV_WEBSALE_PKG.f_get_vehicle_note", parameters01, values01, "VARCHAR").ToString();
            return num;
        }
        public DataTable GetVehicleList(int customer_id, int ou_id1) // BIS_WS_014
        {
            ou_id = ou_id1;// Convert.ToInt32(Session["ou_id"]);
            string[] parameters = new string[] { "p_customer_id", "p_ou_id" };
            object[] values = new object[] { customer_id, ou_id };
            return provider.GetDataTable("dev_om_vehicle_pkg.sp_get_vehicle_list", parameters, values);
        }
        public string CheckVehicleValidate(int customer_id, string vehicle_code, string transport_method_id, int ou_id1) // BIS_WS_014
        {
            ou_id = ou_id1;// Convert.ToInt32(Session["ou_id"]);
            string[] parameters = new string[] { "p_customer_id", "p_vehicle_code", "p_transport_method_id", "p_ou_id" };
            object[] values = new object[] { customer_id, vehicle_code, transport_method_id, ou_id };
            string res = provider.CallFunction("dev_om_vehicle_pkg.f_vehicle_validate", parameters, values, "VARCHAR").ToString();
            return res;
        }

        public string GetItemLine(int customer_id, int item_id, int ou_id) // BTS_WS_001
        {
            //    ou_id = Convert.ToInt32(Session["ou_id"]);
            string[] parameters = new string[] { "p_customer_id", "p_item_id", "p_ou_id" };
            object[] values = new object[] { customer_id, item_id, ou_id };
            string res = provider.CallFunction("dev_websale_pkg.f_get_item_line", parameters, values, "VARCHAR").ToString();
            return res;
        }


        public string KTBIENSOXE(int customer_id, int ou_id1, string bx) // BIS_WS_014
        {
            ou_id = ou_id1;// Convert.ToInt32(Session["ou_id"]);
            string[] parameters = new string[] { "p_customer_id", "p_ou_id" };
            object[] values = new object[] { customer_id, ou_id };
            DataTable rt = provider.GetDataTable("dev_om_vehicle_pkg.sp_get_vehicle_list", parameters, values);
            // DataRow[] rows = rt.Select("VEHICLE_CODE = '"+bx+"'");
            //DataTable filterData = rows.CopyToDataTable();
            for (int i = 0; i < rt.Rows.Count; i++)
            {
                if (rt.Rows[i]["VEHICLE_CODE"].ToString() == bx)
                {
                    return rt.Rows[i]["VEHICLE_CODE"].ToString();
                    break;
                }
            }



            return "NO";


        }
        public string diabanSMS(string code)
        {

            string sql = "select area_id, CODE, name from Dev_om_areas_v where org_id =82 and Active_flag = 'Y' and Code = '" + code + "'";
            DataTable diaban = provider.Query(sql);
            if (diaban.Rows.Count > 0)
            {

                return diaban.Rows[0]["AREA_ID"].ToString();
            }
            else
            {
                return "NO";
            }

        }
        public string KTSPTHEODIABAN(int area_id, int customer_id, int org_id, int contract_id, string item_type, int item_id)
        {

            string[] paramItem = new string[] { "p_area_id", "p_customer_id", "p_org_id", "p_agreement_id", "p_item_type" };
            object[] valItem = new object[] { area_id, customer_id, org_id, contract_id, item_type };
            DataTable dtItem = provider.GetDataTable("DEV_WEBSALE_PKG.sp_get_item_list", paramItem, valItem);
            for (int i = 0; i < dtItem.Rows.Count; i++)
            {
                if (dtItem.Rows[i]["INVENTORY_ITEM_ID"].ToString() == item_id.ToString())
                {
                    return dtItem.Rows[i]["INVENTORY_ITEM_ID"].ToString();
                    break;
                }
            }



            return "NO";

        }
        public DataTable GetBranch(int customer_id, int user_id, int ou_id) // BTS_WS_002
        {
            // ou_id = Convert.ToInt32(Session["ou_id"]);
            string[] parameters = new string[] { "p_customer_id", "p_user_id", "p_ou_id" };
            object[] values = new object[] { customer_id, user_id, ou_id };
            return provider.GetDataTable("dev_websale_pkg.sp_get_branch", parameters, values);
        }
        public string GetBranchSMS(int customer_id, int user_id, int ou_id, string cn) // BTS_WS_002
        {
            // ou_id = Convert.ToInt32(Session["ou_id"]);
            string[] parameters = new string[] { "p_customer_id", "p_user_id", "p_ou_id" };
            object[] values = new object[] { customer_id, user_id, ou_id };

            DataTable chin = provider.GetDataTable("dev_websale_pkg.sp_get_branch", parameters, values);
            if (chin.Rows.Count > 0) //toi tian chi nanh
            {
                for (int i = 0; i < chin.Rows.Count; i++)
                {
                    if (chin.Rows[i]["BRANCH_CODE"].ToString() == cn)
                    {
                        return chin.Rows[i]["BRANCH_ID"].ToString();
                        break;
                    }
                }
                // kiem soat chi nhanh sai //
            }





            return "0";

            // return provider.GetDataTable("dev_websale_pkg.sp_get_branch", parameters, values);
        }

        public double CreditLimitSMS(int customer_id, int header_id, int ou_id1) // thêm vao ou_id1;
        {
            //hạn mức công nợ
            //  ou_id = Convert.ToInt32(Session["ou_id"]); // HM_WS_001 
            ou_id = ou_id1;
            string[] paramCredit = new string[] { "p_cust_id", "p_header_id", "p_ou_id" };
            object[] valCredit = new object[] { customer_id, header_id, ou_id };
            double credit_limit = Convert.ToDouble(provider.CallFunction("DEV_WEBSALE_PKG.f_get_credit_limit_1", paramCredit, valCredit, "NUMBER").ToString());
            return credit_limit;
        }

        public string Timkiemso(string delivery_code, int customer_id, int user_id)
        {
            string[] parameters = new string[] { "p_delivery_code",
                                             "p_customer_id",
                                                      "p_user_id"};
            object[] values = new object[] { delivery_code, customer_id, user_id };
            DataTable dtSO = provider.GetDataTable("DEV_WEBSALE_PKG.sp_find_so", parameters, values);
            //   dtSO.Columns.Add("ORDER_QUANTITY_STRING");
            if (dtSO.Rows.Count > 0)
            {
                return "TRUE";
            }

            else
            {
                return "FALSE";
            }
        }
        public bool DeleteSOSMS(string delivery_code, int user_id1, string description) // thêm vào int userid1
        {
            //return provider.ExecSQL("DEV_WEBSALE_PKG.sp_delete_so","p_order_id",order_id);
            string[] parameters = new string[] { "p_delivercode", "p_user_id" };//, "p_description"
            object[] values = new object[] { delivery_code, user_id1 }; //, description
                                                                        //  return provider.ExecSQL("DEV_WEBSALE_PKG.sp_delete_so_msgh ", parameters, values);
                                                                        // return provider.ExecSQL("DEV_WEBSALE_SYNC_TGC.sp_delete_so_deliverycode", parameters, values);
            return provider.ExecSQL("DEV_WEBSALE_SYNC_TGC.sp_delete_so_msgh ", parameters, values);
        }
        public DataTable Delivery_Code_Info(string DeliveryCodeList)
        {
            return provider.Query(@"select v.DELIVERY_CODE, v.STATUS, v.TIMEIN, v.TIMEOUT, v.ORDER_QUANTITY 
                                    from dev_sales_orders_v v
                                    where v.DELIVERY_CODE in ('" + DeliveryCodeList + "')");
        }



        //For App

        public DataTable GetAreaCode(int customer_id, int ou_id)
        {
            //return provider.Query(@"select a.name,a.area_id,a.code
            //                          from dev_om_areas_v a, customer_checkpoint b, checkpoints c
            //                         where c.checkpoint_id = b.checkpoint_id
            //                           and c.area_id = a.area_id
            //                           and a.active_flag = 'Y'
            //                           and c.active_flag = 'Y'
            //                           and to_date(nvl(a.start_date,sysdate - 1/4), 'DD/MM/RRRR') <= to_date(sysdate - 1/4, 'DD/MM/RRRR')
            //                           and to_date(nvl(a.end_date,sysdate - 1/4), 'DD/MM/RRRR') >= to_date(sysdate - 1/4, 'DD/MM/RRRR')
            //                           and to_date(nvl(b.start_date,sysdate - 1/4), 'DD/MM/RRRR') <= to_date(sysdate - 1/4, 'DD/MM/RRRR')
            //                           and to_date(nvl(b.end_date,sysdate - 1/4), 'DD/MM/RRRR') >= to_date(sysdate - 1/4, 'DD/MM/RRRR')
            //                           and b.customer_id =" + customer_id + " and a.org_id = " + ou_id + " order by a.root_area_code, a.AREA_LEVEL, a.name"
            //                     );


            string[] Param = new string[] { "p_customer_id", "p_ou_id" };
            object[] Val = new object[] { customer_id, ou_id };
            return provider.GetDataTable("DEV_APP_PKG.app_sp_get_order_area ", Param, Val);
        }
        public DataTable GetListItemInContract(int customer_id, int contract_id)
        {

            string[] paramItem = new string[] { "p_customer_id", "p_agreement_id" };
            object[] valItem = new object[] { customer_id, contract_id };
            return provider.GetDataTable("DEV_APP_PKG.app_sp_get_item_contract", paramItem, valItem);
        }
        public DataTable GetListItemInAreaContract(int area_id, int customer_id, int contract_id)
        {

            string[] paramItem = new string[] { "p_area_id", "p_customer_id", "p_agreement_id" };
            object[] valItem = new object[] { area_id, customer_id, contract_id };
            return provider.GetDataTable("DEV_APP_PKG.app_sp_get_item_area_contract", paramItem, valItem);
        }


        
    }
}
