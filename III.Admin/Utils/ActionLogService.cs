using ESEIM.Models;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Utils
{
    public interface IActionLogService
    {
        void InsertActionLog(string DataTableModified, string Message, object valueOldObj, object valueNewObj, string LogLevel);
        void InsertActionLogDeleteItem(string DataTableModified, string Message, object[] valueOldObj, object valueNewObj, string LogLevel);
    }

    public class ActionLogService : IActionLogService
    {
        private EIMDBContext _context;
        private IHttpContextAccessor _accessor;

        public ActionLogService(EIMDBContext context, IHttpContextAccessor accessor)
        {
            _context = context;
            _accessor = accessor;

        }

        public void InsertActionLog(string tableModified, string Message, object valueOldObj, object valueNewObj, string LogLevel)
        {
            AdActionLog _actionLog = new AdActionLog(_accessor);
            if (valueOldObj != null)
            {
                var valueOld = JsonConvert.SerializeObject(valueOldObj);
                _actionLog.DataOld = valueOld;
            }

            if (valueNewObj != null)
            {
                var valueNew = JsonConvert.SerializeObject(valueNewObj);
                _actionLog.DataNew = valueNew;
            }

            _actionLog.TableModified = tableModified;
            _actionLog.ActionLogApplication = "Admin";
            _actionLog.Message = Message;
            _actionLog.LogLevel = LogLevel;

            //_context.Add(_actionLog);
            //_context.SaveChanges();

        }

        public void InsertActionLogDeleteItem(string tableModified, string Message, object[] valueOldObj, object valueNewObj, string LogLevel)
        {
            AdActionLog _actionLog = new AdActionLog(_accessor);
            if (valueOldObj != null)
            {
                var valueOld = JsonConvert.SerializeObject(valueOldObj);
                _actionLog.DataOld = valueOld;
            }
            //  if (valueOldObj.Any())
            //{
            //    var valueOld = JsonConvert.SerializeObject(valueOldObj);
            //    _actionLog.DataOld = valueOld;

            //}
            if (valueNewObj != null)
            {
                var valueNew = JsonConvert.SerializeObject(valueNewObj);
                _actionLog.DataNew = valueNew;
            }

            _actionLog.TableModified = tableModified;
            _actionLog.ActionLogApplication = "Admin";
            _actionLog.Message = Message;
            _actionLog.LogLevel = LogLevel;

            //_context.Add(_actionLog);
            //_context.SaveChanges();

        }

    }
}
