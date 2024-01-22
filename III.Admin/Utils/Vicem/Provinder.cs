using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using System.Configuration;
using System.Data.OracleClient;
using Devart.Data.Oracle;
using VIB.Domain.Common;
//using Oracle.DataAccess;

namespace DataConnection
{
    class Provinder
    {
        private OracleConnection conn;

        const string connectString = "Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.130.164)(PORT=1529))(CONNECT_DATA=(SERVICE_NAME=CNT)));User Id=dev;Password=devabc123;Min Pool Size=5;Max Pool Size=300;Connection Lifetime=120;";
        public OracleConnection con = new OracleConnection(connectString + CommonConst.LICENSE_KEY);

        public static string connectionString { get; set; }

        public Provinder()
        {

            this.conn = new OracleConnection(Provinder.connectionString);
        }


        public DataTable GetDataTable(string storeName, string parameter, object value)
        {
            OracleCommand command = this.con.CreateCommand();
            command.CommandText = storeName;
            command.CommandType = CommandType.StoredProcedure;
            OracleParameter oracleParameter1 = new OracleParameter();
            oracleParameter1.Direction = ParameterDirection.Input;
            oracleParameter1.ParameterName = parameter;

            //Đoạn này sửa
            if (value is int)
                //oracleParameter1.OracleType = OracleType.Number;
                oracleParameter1.OracleDbType = OracleDbType.Number;
            else if (value is string)
                //oracleParameter1.OracleType = OracleType.VarChar;
                oracleParameter1.OracleDbType = OracleDbType.VarChar;
            else if (value is DateTime)
                //oracleParameter1.OracleType = OracleType.DateTime;
                oracleParameter1.OracleDbType = OracleDbType.TimeStamp;


            oracleParameter1.Value = value;
            command.Parameters.Add(oracleParameter1);
            //OracleParameter oracleParameter2 = new OracleParameter();
            //oracleParameter2.Direction = ParameterDirection.Output;
            ////oracleParameter2.OracleType = OracleType.Cursor;
            //oracleParameter2.OracleDbType = OracleDbType.Cursor;
            //oracleParameter2.ParameterName = "P_RETURNCUR";
            //command.Parameters.Add(oracleParameter2);
            OracleDataAdapter oracleDataAdapter = new OracleDataAdapter(command);
            DataTable dataTable = new DataTable();
            oracleDataAdapter.Fill(dataTable);
            this.con.Close();
            return dataTable;
        }

        public DataTable GetDataTable(string storeName, string[] parameters, object[] values)
        {
            OracleCommand command = this.con.CreateCommand();
            command.CommandText = storeName;
            command.CommandType = CommandType.StoredProcedure;
            for (int index = 0; index < parameters.Length; ++index)
            {
                OracleParameter oracleParameter = new OracleParameter();
                oracleParameter.Direction = ParameterDirection.Input;
                oracleParameter.ParameterName = parameters[index];
                if (values[index] is int)
                    //oracleParameter.OracleType = OracleType.Number;
                    oracleParameter.OracleDbType = OracleDbType.Number;
                else if (values[index] is string)
                    //oracleParameter.OracleType = OracleType.VarChar;
                    oracleParameter.OracleDbType = OracleDbType.VarChar;
                else if (values[index] is DateTime)
                    //oracleParameter.OracleType = OracleType.DateTime;
                    oracleParameter.OracleDbType = OracleDbType.TimeStamp;
                oracleParameter.Value = values[index];
                command.Parameters.Add(oracleParameter);
            }
            //OracleParameter oracleParameter1 = new OracleParameter();
            //oracleParameter1.Direction = ParameterDirection.Output;
            ////oracleParameter1.OracleType = OracleType.Cursor;
            //oracleParameter1.OracleDbType = OracleDbType.Cursor;
            //oracleParameter1.ParameterName = "P_RETURNCUR";
            //command.Parameters.Add(oracleParameter1);
            OracleDataAdapter oracleDataAdapter = new OracleDataAdapter(command);
            DataTable dataTable = new DataTable();
            oracleDataAdapter.Fill(dataTable);
            this.con.Close();
            return dataTable;
        }

        public DataTable GetDataTable(string storeName)
        {
            OracleCommand command = this.con.CreateCommand();
            command.CommandText = storeName;
            command.CommandType = CommandType.StoredProcedure;
            //OracleParameter oracleParameter = new OracleParameter();
            //oracleParameter.Direction = ParameterDirection.Output;
            ////oracleParameter.OracleType = OracleType.Cursor;
            //oracleParameter.OracleDbType = OracleDbType.Cursor;
            //oracleParameter.ParameterName = "P_RETURNCUR";
            //command.Parameters.Add(oracleParameter);
            OracleDataAdapter oracleDataAdapter = new OracleDataAdapter(command);
            DataTable dataTable = new DataTable();
            oracleDataAdapter.Fill(dataTable);
            this.con.Close();
            return dataTable;
        }

        public DataTable Query(string query)
        {
            con.Open();
            OracleCommand command = this.con.CreateCommand();
            command.CommandText = query;
            OracleDataAdapter oracleDataAdapter = new OracleDataAdapter(command);
            DataTable dataTable = new DataTable();
            oracleDataAdapter.Fill(dataTable);
            this.con.Close();
            return dataTable;
        }

        public bool ExecSQL(string storeName, string parameter, object value)
        {
            OracleCommand command = this.con.CreateCommand();
            command.CommandText = storeName;
            command.CommandType = CommandType.StoredProcedure;
            OracleParameter oracleParameter = new OracleParameter();
            oracleParameter.Direction = ParameterDirection.Input;
            oracleParameter.ParameterName = parameter;
            //oracleParameter.OracleType = !(value is int) ? (!(value is string) ? OracleType.DateTime : OracleType.VarChar) : OracleType.Number;
            //oracleParameter.OracleDbType = !(value is int) ? (!(value is string) ? OracleDbType.TimeStamp : OracleDbType.VarChar) : OracleDbType.Number;

            if (value is int)
                //oracleParameter.OracleType = OracleType.Number;
                oracleParameter.OracleDbType = OracleDbType.Number;
            else if (value is string)
                //oracleParameter.OracleType = OracleType.VarChar;
                oracleParameter.OracleDbType = OracleDbType.VarChar;
            else if (value is DateTime)
                //oracleParameter.OracleType = OracleType.DateTime;
                oracleParameter.OracleDbType = OracleDbType.TimeStamp;

            oracleParameter.Value = value;
            command.Parameters.Add(oracleParameter);
            this.con.Open();
            try
            {
                command.ExecuteNonQuery();
                this.con.Close();
                return true;
            }
            catch
            {
                this.con.Close();
                return false;
            }
        }

        public bool ExecSQL(string storeName, string[] parameters, object[] values)
        {
            OracleCommand command = this.con.CreateCommand();
            command.CommandText = storeName;
            command.CommandType = CommandType.StoredProcedure;
            for (int index = 0; index < parameters.Length; ++index)
            {
                OracleParameter oracleParameter = new OracleParameter();
                oracleParameter.Direction = ParameterDirection.Input;
                oracleParameter.ParameterName = parameters[index];
                //oracleParameter.OracleType = !(values[index] is DateTime) ? (!(values[index] is string) ? OracleType.Number : OracleType.VarChar) : OracleType.DateTime;
                //oracleParameter.OracleDbType = !(values[index] is DateTime) ? (!(values[index] is string) ? OracleDbType.Number : OracleDbType.VarChar) : OracleDbType.TimeStamp;

                if (values[index] is int)
                    //oracleParameter.OracleType = OracleType.Number;
                    oracleParameter.OracleDbType = OracleDbType.Number;
                else if (values[index] is string)
                    //oracleParameter.OracleType = OracleType.VarChar;
                    oracleParameter.OracleDbType = OracleDbType.VarChar;
                else if (values[index] is DateTime)
                    //oracleParameter.OracleType = OracleType.DateTime;
                    oracleParameter.OracleDbType = OracleDbType.TimeStamp;

                oracleParameter.Value = values[index];
                command.Parameters.Add(oracleParameter);
            }
            this.con.Open();
            try
            {
                command.ExecuteNonQuery();
                this.con.Close();
                return true;
            }
            catch
            {
                this.con.Close();
                return false;
            }
        }

        public bool ExecSQL(string query)
        {
            OracleCommand command = this.con.CreateCommand();
            command.CommandText = query;
            this.con.Open();
            try
            {
                command.ExecuteNonQuery();
                this.con.Close();
                return true;
            }
            catch
            {
                this.con.Close();
                return false;
            }
        }

        public object[] ExecSQL_SO(string storeName, string[] parameters, object[] values)
        {
            OracleCommand command = this.con.CreateCommand();
            command.CommandText = storeName;
            command.CommandType = CommandType.StoredProcedure;
            for (int index = 0; index < parameters.Length; ++index)
            {
                OracleParameter oracleParameter = new OracleParameter();
                oracleParameter.Direction = ParameterDirection.Input;
                oracleParameter.ParameterName = parameters[index];
                //oracleParameter.OracleType = !(values[index] is DateTime) ? (!(values[index] is string) ? OracleType.Number : OracleType.VarChar) : OracleType.DateTime;
                //oracleParameter.OracleDbType = !(values[index] is DateTime) ? (!(values[index] is string) ? OracleDbType.Number : OracleDbType.VarChar) : OracleDbType.TimeStamp;

                if (values[index] is int)
                    //oracleParameter.OracleType = OracleType.Number;
                    oracleParameter.OracleDbType = OracleDbType.Number;
                else if (values[index] is string)
                    //oracleParameter.OracleType = OracleType.VarChar;
                    oracleParameter.OracleDbType = OracleDbType.VarChar;
                else if (values[index] is DateTime)
                    //oracleParameter.OracleType = OracleType.DateTime;
                    oracleParameter.OracleDbType = OracleDbType.TimeStamp;

                oracleParameter.Value = values[index];
                command.Parameters.Add(oracleParameter);
            }
            //OracleParameter oracleParameter1 = command.Parameters.Add("p_order_id", OracleType.Number);
            OracleParameter oracleParameter1 = command.Parameters.Add("p_order_id", OracleDbType.Number);
            oracleParameter1.Direction = ParameterDirection.Output;
            //OracleParameter oracleParameter2 = command.Parameters.Add("p_delivery_code", OracleType.VarChar, 9);
            OracleParameter oracleParameter2 = command.Parameters.Add("p_delivery_code", OracleDbType.VarChar, 9);
            oracleParameter2.Direction = ParameterDirection.Output;
            this.con.Open();
            try
            {
                command.ExecuteNonQuery();
                this.con.Close();
                return new object[2]
        {
          oracleParameter1.Value,
          oracleParameter2.Value
        };
            }
            catch
            {
                this.con.Close();
                return (object[])null;
            }
        }

        public object ExecSQL_SO_DCode(string storeName, string[] parameters, object[] values)
        {
            OracleCommand command = this.con.CreateCommand();
            command.CommandText = storeName;
            command.CommandType = CommandType.StoredProcedure;
            for (int index = 0; index < parameters.Length; ++index)
            {
                OracleParameter oracleParameter = new OracleParameter();
                oracleParameter.Direction = ParameterDirection.Input;
                oracleParameter.ParameterName = parameters[index];
                //oracleParameter.OracleType = !(values[index] is DateTime) ? (!(values[index] is string) ? OracleType.Number : OracleType.VarChar) : OracleType.DateTime;
                //oracleParameter.OracleDbType = !(values[index] is DateTime) ? (!(values[index] is string) ? OracleDbType.Number : OracleDbType.VarChar) : OracleDbType.TimeStamp;

                if (values[index] is int)
                    //oracleParameter.OracleType = OracleType.Number;
                    oracleParameter.OracleDbType = OracleDbType.Number;
                else if (values[index] is string)
                    //oracleParameter.OracleType = OracleType.VarChar;
                    oracleParameter.OracleDbType = OracleDbType.VarChar;
                else if (values[index] is DateTime)
                    //oracleParameter.OracleType = OracleType.DateTime;
                    oracleParameter.OracleDbType = OracleDbType.TimeStamp;
                else if (values[index] is double)
                    oracleParameter.OracleDbType = OracleDbType.Number;
                else if (values[index] is float)
                    oracleParameter.OracleDbType = OracleDbType.Number;

                oracleParameter.Value = values[index];
                command.Parameters.Add(oracleParameter);
            }
            //command.Parameters.Add("p_order_id", OracleType.Number).Direction = ParameterDirection.Output;
            command.Parameters.Add("p_order_id", OracleDbType.Number).Direction = ParameterDirection.Output;
            //OracleParameter oracleParameter1 = command.Parameters.Add("p_delivery_code", OracleType.VarChar, 9);
            OracleParameter oracleParameter1 = command.Parameters.Add("p_delivery_code", OracleDbType.VarChar, 9);
            oracleParameter1.Direction = ParameterDirection.Output;
            this.con.Open();
            try
            {
                command.ExecuteNonQuery();
                this.con.Close();
                return oracleParameter1.Value;
            }
            catch (Exception ex)
            {
                this.con.Close();
                return (object)false;
            }
        }

        public object ExecScalar(string storeName, string parameter, object value)
        {
            OracleCommand command = this.con.CreateCommand();
            command.CommandText = storeName;
            command.CommandType = CommandType.StoredProcedure;
            OracleParameter oracleParameter = new OracleParameter();
            oracleParameter.Direction = ParameterDirection.Input;
            oracleParameter.ParameterName = parameter;
            //oracleParameter.OracleType = !(value is int) ? OracleType.VarChar : OracleType.Number;
            //oracleParameter.OracleDbType = !(value is int) ? OracleDbType.VarChar : OracleDbType.Number;

            if (value is int)
                //oracleParameter.OracleType = OracleType.Number;
                oracleParameter.OracleDbType = OracleDbType.Number;
            else if (value is string)
                //oracleParameter.OracleType = OracleType.VarChar;
                oracleParameter.OracleDbType = OracleDbType.VarChar;
            else if (value is DateTime)
                //oracleParameter.OracleType = OracleType.DateTime;
                oracleParameter.OracleDbType = OracleDbType.TimeStamp;

            oracleParameter.Value = value;
            command.Parameters.Add(oracleParameter);
            this.con.Open();
            object obj = command.ExecuteScalar();
            this.con.Close();
            return obj;
        }

        public object ExecScalar(string storeName, string[] parameters, object[] values, string outputType)
        {
            OracleCommand command = this.con.CreateCommand();
            command.CommandText = storeName;
            command.CommandType = CommandType.StoredProcedure;
            for (int index = 0; index < parameters.Length; ++index)
            {
                OracleParameter oracleParameter = new OracleParameter();
                oracleParameter.Direction = ParameterDirection.Input;
                oracleParameter.ParameterName = parameters[index];
                //oracleParameter.OracleType = !(values[index] is int) ? OracleType.VarChar : OracleType.Number;
                //oracleParameter.OracleDbType = !(values[index] is int) ? OracleDbType.VarChar : OracleDbType.Number;

                if (values[index] is int)
                    //oracleParameter.OracleType = OracleType.Number;
                    oracleParameter.OracleDbType = OracleDbType.Number;
                else if (values[index] is string)
                    //oracleParameter.OracleType = OracleType.VarChar;
                    oracleParameter.OracleDbType = OracleDbType.VarChar;
                else if (values[index] is DateTime)
                    //oracleParameter.OracleType = OracleType.DateTime;
                    oracleParameter.OracleDbType = OracleDbType.TimeStamp;

                oracleParameter.Value = values[index];
                command.Parameters.Add(oracleParameter);
            }
            OracleParameter oracleParameter1 = new OracleParameter();
            oracleParameter1.Direction = ParameterDirection.Output;
            //oracleParameter1.OracleType = !outputType.Equals("NUMBER") ? OracleType.VarChar : OracleType.Number;
            oracleParameter1.OracleDbType = !outputType.Equals("NUMBER") ? OracleDbType.VarChar : OracleDbType.Number;
            oracleParameter1.ParameterName = "P_RETURN";
            command.Parameters.Add(oracleParameter1);
            this.con.Open();
            object obj = command.ExecuteScalar();
            this.con.Close();
            return obj;
        }

        public object ExecScalar(string query)
        {

            OracleCommand command = this.con.CreateCommand();
            command.CommandText = query;
            con.Open();
            object obj = command.ExecuteScalar();
            con.Close();
            return obj;
        }

        public object CallFunction(string funcName, string parameter, object value, string outputType)
        {
            OracleCommand command = con.CreateCommand();
            command.CommandText = funcName;
            command.CommandType = CommandType.StoredProcedure;
            OracleParameter oracleParameter1 = new OracleParameter();
            oracleParameter1.Direction = ParameterDirection.Input;
            oracleParameter1.ParameterName = parameter;
            if (value is int)
                //oracleParameter1.OracleType = OracleType.Number;
                oracleParameter1.OracleDbType = OracleDbType.Number;
            else if (value is string)
                //oracleParameter1.OracleType = OracleType.VarChar;
                oracleParameter1.OracleDbType = OracleDbType.VarChar;
            else if (value is DateTime)
                //oracleParameter1.OracleType = OracleType.DateTime;
                oracleParameter1.OracleDbType = OracleDbType.TimeStamp;
            oracleParameter1.Value = value;
            command.Parameters.Add(oracleParameter1);
            OracleParameter oracleParameter2 = new OracleParameter();
            oracleParameter2.ParameterName = "res";
            if (outputType.Equals("NUMBER"))
                //oracleParameter2.OracleType = OracleType.Number;
                oracleParameter2.OracleDbType = OracleDbType.Number;
            else if (outputType.Equals("VARCHAR"))
            {
                //oracleParameter2.OracleType = OracleType.VarChar;
                oracleParameter2.OracleDbType = OracleDbType.VarChar;
                oracleParameter2.Size = 1000;
            }
            else if (outputType.Equals("DATE"))
                //oracleParameter2.OracleType = OracleType.DateTime;
                oracleParameter2.OracleDbType = OracleDbType.TimeStamp;
            oracleParameter2.Direction = ParameterDirection.ReturnValue;
            command.Parameters.Add(oracleParameter2);
            con.Open();
            command.ExecuteNonQuery();
            con.Close();
            return oracleParameter2.Value;
        }

        public object CallFunction(string funcName, string[] parameters, object[] values, string outputType)
        {
            OracleCommand command = this.con.CreateCommand();
            command.CommandText = funcName;
            command.CommandType = CommandType.StoredProcedure;
            for (int index = 0; index < parameters.Length; ++index)
            {
                OracleParameter oracleParameter = new OracleParameter();
                oracleParameter.Direction = ParameterDirection.Input;
                oracleParameter.ParameterName = parameters[index];
                if (values[index] is int)
                    //oracleParameter.OracleType = OracleType.Number;
                    oracleParameter.OracleDbType = OracleDbType.Number;
                else if (values[index] is string)
                    //oracleParameter.OracleType = OracleType.VarChar;
                    oracleParameter.OracleDbType = OracleDbType.VarChar;
                else if (values[index] is DateTime)
                    //oracleParameter.OracleType = OracleType.DateTime;
                    oracleParameter.OracleDbType = OracleDbType.TimeStamp;
                oracleParameter.Value = values[index];
                command.Parameters.Add(oracleParameter);
            }
            OracleParameter oracleParameter1 = new OracleParameter();
            oracleParameter1.ParameterName = "res";
            if (outputType.Equals("NUMBER"))
                //oracleParameter1.OracleType = OracleType.Number;
                oracleParameter1.OracleDbType = OracleDbType.Number;
            else if (outputType.Equals("VARCHAR"))
            {
                //oracleParameter1.OracleType = OracleType.VarChar;
                oracleParameter1.OracleDbType = OracleDbType.VarChar;
                oracleParameter1.Size = 1000;
            }
            else if (outputType.Equals("DATE"))
                //oracleParameter1.OracleType = OracleType.DateTime;
                oracleParameter1.OracleDbType = OracleDbType.TimeStamp;
            oracleParameter1.Direction = ParameterDirection.ReturnValue;
            command.Parameters.Add(oracleParameter1);
            this.con.Open();
            command.ExecuteNonQuery();
            this.con.Close();
            return oracleParameter1.Value;
        }
    }
}
