using System;
using System.Data;
using System.Configuration;
using System.Linq;
using System.Web;
//using System.Web.Security;
//using System.Web.UI;
//using System.Web.UI.HtmlControls;
//using System.Web.UI.WebControls;
//using System.Web.UI.WebControls.WebParts;
using System.Xml.Linq;
using DataConnection;
//using PTS_OracleProvider;

/// <summary>
/// Summary description for Login_DL
/// </summary>
public class Login_DL
{
    //OracleProvider provider = new OracleProvider();
    Provinder provider = new Provinder();
    public static int ou_id = 0;
    public Login_DL()
    {
        //
        // TODO: Add constructor logic here
        //
        //OracleProvider.connectionString = ConfigurationManager.ConnectionStrings["DBconnect"].ConnectionString;
    }
    public DataTable GetLogin(string username, string password)
    {
        string[] parameters = new string[] { "p_username", "p_userpass" };
        object[] values = new object[] { username, password };
        DataTable dtUsers = provider.GetDataTable("DEV_WEBSALE_PKG.sp_checklogin", parameters, values);
        return dtUsers;
    }
    public DataTable GetLogin(string username, string password, int ou_id) // HM_WS_001
    {
        string[] parameters = new string[] { "p_username", "p_userpass", "p_ou_id" };
        object[] values = new object[] { username, password, ou_id };
        DataTable dtUsers = provider.GetDataTable("DEV_WEBSALE_PKG.sp_checklogin", parameters, values);
        return dtUsers;
    }
    public bool UpdateLogin(string username, string password)
    {
        string[] parameters = new string[] { "p_username", "p_userpass" };
        object[] values = new object[] { username, password };
        return provider.ExecSQL("DEV_WEBSALE_PKG.sp_checklogin_update", parameters, values);
    }
    public DataTable GetLoginFail(string username)
    {
        string[] parameters = new string[] { "p_username" };
        object[] values = new object[] { username };
        DataTable dtUsers = provider.GetDataTable("DEV_WEBSALE_PKG.sp_checklogin_fail", parameters, values);
        return dtUsers;
    }
    //public int GetLoginAllow(int p_user_id)
    //{
    //    ou_id = Convert.ToInt32(CMS.Session.Get("ou_id"));
    //    string[] parameters = new string[] { "p_user_id", "p_ou_id" };
    //    object[] values = new object[] { p_user_id, ou_id };
    //    int v_allow = Convert.ToInt32(provider.CallFunction("DEV_WEBSALE_PKG.f_checklogin_allow", parameters, values, "NUMBER"));
    //    return v_allow;
    //}
    public int CountLogin(string username, string password, int ou_id)
    {
        string[] parameters = new string[] { "p_username", "p_userpass", "p_ou_id" };
        object[] values = new object[] { username, password, ou_id };
        object num = provider.CallFunction("DEV_WEBSALE_PKG.f_countlogin", parameters, values, "NUMBER");
        return Convert.ToInt32(num);
    }
}