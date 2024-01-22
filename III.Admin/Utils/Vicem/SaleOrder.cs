
/// <summary>
/// Summary description for HT_W_01
/// </summary>
using System.Data;
public class SaleOrder
{
    public int order_id { get; set; }
    public int customer_id { get; set; }
    public int invoice_to_org_id { get; set; }
    public int ship_to_org_id { get; set; }
    public int blanket_id { get; set; }
    public int ship_from_org_id { get; set; }
    public int inventory_item_id { get; set; }
    public int transport_method_id { get; set; }
    public int checkpoint_id { get; set; }
    public int price_list_id { get; set; }
    public int user_id { get; set; }
    public int order_type { get; set; }
    public int source_document_line_id { get; set; }
    public int receiver_id { get; set; }
    public int receive_type { get; set; }
    public double quantity { get; set; }
    public double unit_price { get; set; }
    public double amount { get; set; }
    public double discount { get; set; }
    public string currency_code { get; set; }
    public string vehicle_code { get; set; }
    public string driver_name { get; set; }
    public string receiver_name { get; set; }
    public string description { get; set; }
    public string promo_flag { get; set; }
    public string order_item { get; set; }
    public string status { get; set; }
    public string status_description { get; set; }
    public string uom_code { get; set; }
    public string delivery_code { get; set; }
    public string pack_type { get; set; }
    public string bag_type { get; set; }
    public string ship_from_name { get; set; }
    public string transport_method_name { get; set; }
    public string checkpoint_name { get; set; }
    public string doc_num { get; set; }      // WS_004
    public string order_date { get; set; }   // WS_004
    public string doc_series { get; set; }   // TD_WS_003
    public string doc_template { get; set; } // TD_WS_003
    public string lot_number { get; set; }   // TD_WS_003
    public VCCustomer customerInfo { get; set; }


    public string print_status { get; set; }  // BIS_WS_002
    public string location_code { get; set; } // BIS_WS_002
    public string driver_info { get; set; }   // BIS_WS_002
    public int ex_customer_id { get; set; }   // BIS_WS_002
    public double ex_unit_price { get; set; } // BIS_WS_002
    public double tax_amount { get; set; }    // BIS_WS_002
    public int shippoint_id { get; set; }     // BIS_WS_002
    public int area_id { get; set; }          // BIS_WS_002
    public string mooc_code { get; set; }     // BIS_WS_002

    //Bút Sơn 22/12/2016
    public string log { get; set; }     // BIS_WS_002
    public string production_line { get; set; }     // BTS_WS_001
    public int branch_id { get; set; }     // BTS_WS_002
    public double weight_in { get; set; }
    public double weight_out { get; set; }
    public string time_in { get; set; }
    public string time_out { get; set; }
    //public int order_id { get; set; }
    //public int customer_id { get; set; }
    //public int invoice_to_org_id { get; set; }
    //public int ship_to_org_id { get; set; }
    //public int blanket_id { get; set; }
    //public int ship_from_org_id { get; set; }
    //public int inventory_item_id { get; set; }
    //public int transport_method_id { get; set; }
    //public int checkpoint_id { get; set; }
    //public int price_list_id { get; set; }
    //public int user_id { get; set; }
    //public int order_type { get; set; }
    //public int source_document_line_id { get; set; }
    //public int receiver_id { get; set; }
    //public int receive_type { get; set; }
    //public double quantity { get; set; }
    //public double unit_price { get; set; }
    //public double amount { get; set; }
    //public double discount { get; set; }
    //public string currency_code { get; set; }
    //public string vehicle_code { get; set; }
    //public string driver_name { get; set; }
    //public string receiver_name { get; set; }
    //public string description { get; set; }
    //public string promo_flag { get; set; }
    //public string order_item { get; set; }
    //public string  status { get; set; }
    //public string status_description { get; set; }
    //public string uom_code { get; set; }
    //public string delivery_code { get; set; }
    //public string pack_type { get; set; }
    //public string bag_type { get; set; }
    //public string ship_from_name { get; set; }
    //public string transport_method_name { get; set; }
    //public string checkpoint_name { get; set; }
    //public string doc_num { get; set; }      // WS_004
    //public string order_date { get; set; }   // WS_004
    //public string doc_series { get; set; }   // TD_WS_003
    //public string doc_template { get; set; } // TD_WS_003
    //public string lot_number { get; set; }   // TD_WS_003
    //public Customer customerInfo { get; set; }


    //public string print_status { get; set; }  // BIS_WS_002
    //public string location_code { get; set; } // BIS_WS_002
    //public string driver_info { get; set; }   // BIS_WS_002
    //public int ex_customer_id { get; set; }   // BIS_WS_002
    //public double ex_unit_price { get; set; } // BIS_WS_002
    //public double tax_amount { get; set; }    // BIS_WS_002
    //public int shippoint_id { get; set; }     // BIS_WS_002
    //public int area_id { get; set; }          // BIS_WS_002
    //public string mooc_code { get; set; }     // BIS_WS_002

    public SaleOrder()
    {
        //
        // TODO: Add constructor logic here
        //
    }
}