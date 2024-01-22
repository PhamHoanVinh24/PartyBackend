using III.Admin.Utils;
using Microsoft.Extensions.Configuration;
using System;
using System.Data;
using System.Data.SqlClient;

namespace ESEIM.Utils
{
    public interface IRepositoryService
    {
        DataTable GetDataTableProcedureSql(string storeName, string[] parameters, object[] values);
        void CallProc(string storeName, string[] parameters, object[] values);
    }
    public class RepositoryService : IRepositoryService
    {
        public IConfiguration _configuration { get; }
        public RepositoryService(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public DataTable GetDataTableProcedureSql(string storeName, string[] parameters, object[] values)
        {
            //using (SqlConnection sqlConn = new SqlConnection(EncodeConnectString.DecryptString(_configuration.GetConnectionString("EIMConnection"))))
            using (SqlConnection sqlConn = new SqlConnection(_configuration.GetConnectionString("EIMConnection")))
            {
                sqlConn.Open();
                DataTable dt = new DataTable();
                try
                {
                    string sql = storeName;
                    using (SqlCommand sqlCmd = new SqlCommand(sql, sqlConn))
                    {
                        sqlCmd.CommandType = CommandType.StoredProcedure;
                        sqlCmd.CommandTimeout = 90;
                        for (int index = 0; index < parameters.Length; ++index)
                        {
                            sqlCmd.Parameters.AddWithValue(parameters[index], values[index]);
                        }
                        using (SqlDataAdapter sqlAdapter = new SqlDataAdapter(sqlCmd))
                        {
                            sqlAdapter.Fill(dt);
                        }
                    }
                }
                catch (Exception ex)
                {
                }
                finally
                {
                    sqlConn.Close();
                }
                return dt;
            }
        }

        public void CallProc(string storeName, string[] parameters, object[] values)
        {
            //using (SqlConnection sqlConn = new SqlConnection(EncodeConnectString.DecryptString(_configuration.GetConnectionString("EIMConnection"))))
            using (SqlConnection sqlConn = new SqlConnection(_configuration.GetConnectionString("EIMConnection")))
            {
                sqlConn.Open();
                try
                {
                    string sql = storeName;
                    using (SqlCommand sqlCmd = new SqlCommand(sql, sqlConn))
                    {
                        sqlCmd.CommandType = CommandType.StoredProcedure;
                        for (int index = 0; index < parameters.Length; ++index)
                        {
                            sqlCmd.Parameters.AddWithValue(parameters[index], values[index]);
                        }
                        sqlCmd.ExecuteNonQuery();
                    }
                }
                catch (Exception ex)
                {
                }
                finally
                {
                    sqlConn.Close();
                }
            }
        }
    }
}
