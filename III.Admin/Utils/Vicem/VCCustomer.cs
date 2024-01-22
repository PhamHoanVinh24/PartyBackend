using System;
using System.Data;
using System.Configuration;




/// <summary>
/// Summary description for Customer
/// </summary>
public class VCCustomer
{
    public int customer_id { get; set; }
    public string customer_name { get; set; }
    public string customer_number { get; set; }
    public double currentDebtAmount { get; set; }
    public double receivedAmount { get; set; }
    public double bookAmount { get; set; }
    public string saleperson { get; set; }
    public DataTable billtolocation { get; set; }
    public DataTable shiptolocation { get; set; }
    public DataTable contracts { get; set; }
    public DataTable contracts_ntm { get; set; }
    public DataTable checkpoints { get; set; }
    public DataTable receiver { get; set; }
    public string ship_to_name { get; set; }
    public string invoice_to_name { get; set; }
    public string list_vehicle_prevent { get; set; }
    public VCCustomer()
    {
        //
        // TODO: Add constructor logic here
        //
    }
}
