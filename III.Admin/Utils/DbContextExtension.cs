using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace ESEIM.Utils
{
    public static class DbContextExtension
    {
        public static RelationalDataReader ExecuteSqlQuery(this DatabaseFacade databaseFacade, string sql, params object[] parameters)
        {
            var concurrencyDetector = databaseFacade.GetService<IConcurrencyDetector>();

            using (concurrencyDetector.EnterCriticalSection())
            {
                var rawSqlCommand = databaseFacade.GetService<IRawSqlCommandBuilder>().Build(sql, parameters);

                var relationalDataReader = rawSqlCommand.RelationalCommand.ExecuteReader(databaseFacade.GetService<IRelationalConnection>(), parameterValues: rawSqlCommand.ParameterValues);
                return relationalDataReader;
            }
        }

        public static async Task<RelationalDataReader> ExecuteSqlQueryAsync(this DatabaseFacade databaseFacade, string sql, params object[] parameters)
        {
            var concurrencyDetector = databaseFacade.GetService<IConcurrencyDetector>();

            using (concurrencyDetector.EnterCriticalSection())
            {
                var rawSqlCommand = databaseFacade.GetService<IRawSqlCommandBuilder>().Build(sql, parameters);
                var relationalConnection = databaseFacade.GetService<IRelationalConnection>();

                var relationalDataReader = await rawSqlCommand.RelationalCommand.ExecuteReaderAsync(relationalConnection, parameterValues: rawSqlCommand.ParameterValues);
                return relationalDataReader;
            }
        }

        public static IEnumerable<T> ExecuteSqlQuery<T>(this DatabaseFacade databaseFacade, string sql, params object[] parameters) where T : new()
        {
            var relationalDataReader = databaseFacade.ExecuteSqlQuery(sql, parameters);
            return GetModelFromDataReader<T>(relationalDataReader);
        }

        public static async Task<IEnumerable<T>> ExecuteSqlQueryAsync<T>(this DatabaseFacade databaseFacade, string sql, params object[] parameters) where T : new()
        {
            var relationalDataReader = await databaseFacade.ExecuteSqlQueryAsync(sql, parameters);
            return GetModelFromDataReader<T>(relationalDataReader);
        }

        public static IEnumerable<T> GetModelFromDataReader<T>(RelationalDataReader relationalDataReader) where T : new()
        {
            using (DbDataReader dr = relationalDataReader.DbDataReader)
            {
                List<T> lst = new List<T>();
                PropertyInfo[] props = typeof(T).GetProperties();
                while (dr.Read())
                {
                    T t = new T();
                    //IEnumerable<string> actualNames = dr.GetColumnSchema().Select(o => o.ColumnName);
                    for (int i = 0; i < props.Length; ++i)
                    {
                        PropertyInfo pi = props[i];

                        if (!pi.CanWrite) continue;

                        System.ComponentModel.DataAnnotations.Schema.ColumnAttribute ca = pi.GetCustomAttribute(typeof(System.ComponentModel.DataAnnotations.Schema.ColumnAttribute)) as System.ComponentModel.DataAnnotations.Schema.ColumnAttribute;
                        string name = ca?.Name ?? pi.Name;

                        if (pi == null) continue;

                        //if (!actualNames.Contains(name))
                        //{
                        //    continue;
                        //}
                        object value = dr[name];
                        Type pt = pi.DeclaringType;
                        bool nullable = pt.GetTypeInfo().IsGenericType && pt.GetGenericTypeDefinition() == typeof(Nullable<>);
                        if (value == DBNull.Value)
                        {
                            value = null;
                        }
                        if (value == null && pt.GetTypeInfo().IsValueType && !nullable)
                        {
                            value = Activator.CreateInstance(pt);
                        }
                        pi.SetValue(t, value);
                    }//for i
                    lst.Add(t);
                }//while
                return lst;
            }//using dr
        }
    }
}