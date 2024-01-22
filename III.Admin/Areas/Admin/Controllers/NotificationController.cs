using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Globalization;
using III.Domain.Enums;

namespace III.Admin.Controllers
{
    public class JtableModelNotification : JTableModel
    {
        public string Name { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
    }
    [Area("Admin")]
    public class NotificationController : BaseController
    {
        private readonly EIMDBContext _context;
        public NotificationController(EIMDBContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]JtableModelNotification jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            DateTime? fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            DateTime? toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var query = from a in _context.Notifications
                        join b in listCommon on a.Status equals b.CodeSet into b1
                        from b in b1.DefaultIfEmpty()
                        where !a.IsDeleted
                            && (string.IsNullOrEmpty(jTablePara.Name) || a.Title.ToLower().Contains(jTablePara.Name.ToLower()))
                            && ((fromDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date >= fromDate))
                            && ((toDate == null) || (a.CreatedTime.HasValue && a.CreatedTime.Value.Date <= toDate))
                        select new
                        {
                            a.NotifyID,
                            a.NotifyCode,
                            a.Title,
                            a.Content,
                            a.ReceiverConfirm,
                            a.LstContractCode,
                            a.ConfirmTime,
                            Status = b != null ? b.ValueSet : "",
                            a.CreatedTime
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "NotifyID", "NotifyCode", "Title", "Content", "ReceiverConfirm", "LstContractCode", "ConfirmTime", "Status", "CreateTime");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult GetStatus()
        {
            var data = _context.CommonSettings.Where(x => x.Group == EnumHelper<PublishEnum>.GetDisplayValue(PublishEnum.Status)).Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
            return Json(data);
        }

        [HttpPost]
        public object GetContract()
        {
            var query = _context.PoSaleHeaders.Where(x => !x.IsDeleted).Select(x => new Properties { Code = x.ContractCode, Name = x.Title });
            return query;
        }


        [HttpPost]
        public JsonResult GetItem([FromBody] int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.Notifications.FirstOrDefault(x => x.NotifyID == id);
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("NTC_ERR_NOTIFICATION"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Insert([FromBody]Notification obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var checkExist = _context.Notifications.FirstOrDefault(x => x.NotifyCode == obj.NotifyCode);
                if (checkExist == null)
                {
                    obj.CreatedTime = DateTime.Now;
                    _context.Notifications.Add(obj);
                    _context.SaveChanges();
                    msg.Title =String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("NTC_NOTIFICATION"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("NTC_NOTIFICATION"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }


        [HttpPost]
        public JsonResult Update([FromBody]Notification obj)
        {
            var message = new JMessage { Error = false, Title = "" };
            try
            {
                if (obj == null)
                {
                    message.Error = true;
                    message.Title = String.Format(CommonUtil.ResourceValue("NTC_ERR_UPDATE_NOTIFICATION"));
                }
                else
                {
                    //check exist code
                    var checkExist = _context.Notifications.FirstOrDefault(x => x.NotifyCode == obj.NotifyCode && x.NotifyID != obj.NotifyID);
                    if (checkExist != null)
                    {
                        message.Error = true;
                        message.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("NTC_CURD_LBL_CODE"));
                    }
                    else
                    {
                        obj.UpdatedBy = ESEIM.AppContext.UserName;
                        obj.UpdatedTime = DateTime.Now;
                        _context.Notifications.Update(obj);
                        _context.SaveChanges();
                        message.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("NTC_NOTIFICATION"));
                    }
                }
            }
            catch (Exception ex)
            {
                message.Error = true;
                message.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_FAILED"), CommonUtil.ResourceValue("NTC_NOTIFICATION"));
            }
            return Json(message);
        }


        [HttpPost]
        public JsonResult Delete([FromBody]int id)
        {
            var mess = new JMessage { Error = false, Title = "" };
            try
            {
                var notification = _context.Notifications.FirstOrDefault(x => x.NotifyID == id);
                _context.Remove(notification);
                _context.SaveChanges();
                mess.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("NTC_NOTIFICATION"));
            }
            catch (Exception ex)
            {
                mess.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_FAIL"), CommonUtil.ResourceValue("NTC_NOTIFICATION"));
                mess.Error = true;
            }
            return Json(mess);
        }
    }
}