using System.Data;

/// <summary>
/// Summary description for Contract
/// </summary>
public class Contract
{
    public int contract_id { get; set; }
    public string contract_number { get; set; }
    public DataTable items { get; set; }
    public Contract()
    {
        //
        // TODO: Add constructor logic here
        //
    }
}
