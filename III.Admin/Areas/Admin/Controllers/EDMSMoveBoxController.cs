using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSMoveBoxController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;

        public EDMSMoveBoxController(EIMDBContext context, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult JTable([FromBody]JTableModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.EDMSMoveBoxLogs.Where(x => string.IsNullOrEmpty(x.RackCodeOld))
                        join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                        join c in _context.EDMSBoxs on a.BoxCode equals c.BoxCode
                        join e in _context.EDMSRacks on a.RackCodeNew equals e.RackCode
                        join e1 in _context.EDMSLines on e.LineCode equals e1.LineCode
                        join e2 in _context.EDMSFloors on e1.FloorCode equals e2.FloorCode
                        join e3 in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "RV") on e2.WHS_Code equals e3.WHS_Code
                        select new
                        {
                            a.Id,
                            a.CreatedBy,
                            StaffName = b.GivenName,
                            a.CreatedTime,
                            CreatedTimeString = a.CreatedTime.ToString("dd/MM/yyyy"),
                            a.BoxCode,
                            c.NumBoxth,
                            a.RackCodeOld,
                            RackOldName = "",
                            a.RackCodeNew,
                            RackNewName = e2.FloorName + " - " + e1.L_Text + " - " + e.RackName,
                            e3.WHS_Name
                        };
            var query1 = from a in _context.EDMSMoveBoxLogs.Where(x => !string.IsNullOrEmpty(x.RackCodeOld))
                         join b in _context.Users.Where(x => x.Active) on a.CreatedBy equals b.UserName
                         join c in _context.EDMSBoxs on a.BoxCode equals c.BoxCode
                         join d in _context.EDMSRacks on a.RackCodeOld equals d.RackCode
                         join d1 in _context.EDMSLines on d.LineCode equals d1.LineCode
                         join d2 in _context.EDMSFloors on d1.FloorCode equals d2.FloorCode
                         join e in _context.EDMSRacks on a.RackCodeNew equals e.RackCode
                         join e1 in _context.EDMSLines on e.LineCode equals e1.LineCode
                         join e2 in _context.EDMSFloors on e1.FloorCode equals e2.FloorCode
                         join e3 in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "RV") on e2.WHS_Code equals e3.WHS_Code
                         select new
                         {
                             a.Id,
                             a.CreatedBy,
                             StaffName = b.GivenName,
                             a.CreatedTime,
                             CreatedTimeString = a.CreatedTime.ToString("dd/MM/yyyy"),
                             a.BoxCode,
                             c.NumBoxth,
                             a.RackCodeOld,
                             RackOldName = d2.FloorName + " - " + d1.L_Text + " - " + d.RackName,
                             a.RackCodeNew,
                             RackNewName = e2.FloorName + " - " + e1.L_Text + " - " + e.RackName,
                             e3.WHS_Name
                         };
            var query2 = query.Union(query1).OrderByDescending(x => x.CreatedTime);

            var count = query2.Count();
            var data = query2.Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "CreatedBy", "StaffName", "CreatedTime", "CreatedTimeString", "BoxCode", "NumBoxth", "RackCodeOld", "RackOldName", "RackCodeNew", "RackNewName", "WHS_Name");
            return Json(jdata);
        }

        //--------------------------------kiểm tra---------------------------   
        [HttpPost]
        public JsonResult Check([FromBody]EDMSMoveBoxInsert obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var chkExist = _context.EDMSEntityMappings.Any(x => x.BoxCode == obj.BoxCode && x.RackCode == obj.RackCode);
                if (chkExist)
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Thùng chọn đã được xếp vào vị trí của kệ này"));
                }
                else
                {
                    var rack = _context.EDMSRacks.FirstOrDefault(x => x.RackCode == obj.RackCode);
                    int maxbox = rack.CNT_Box;
                    var countBoxInRack = _context.EDMSEntityMappings.Any(x => x.RackCode == obj.RackCode)
                                        ? _context.EDMSEntityMappings.Where(x => x.RackCode == obj.RackCode).Count()
                                        : 0;
                    if (countBoxInRack >= maxbox)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("EDMSMB_MSG_SHELF_POSITION_FILLED"));//Vị trí kệ đã được xếp đầy các thùng
                    }
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Lỗi khi check dữ liệu"));
            }
            return Json(msg);
        }

        //--------------------------------Đổi vị trí---------------------------   
        [HttpPost]
        public JsonResult Save([FromBody]EDMSMoveBoxInsert obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var chkExist = _context.EDMSEntityMappings.Any(x => x.BoxCode == obj.BoxCode && x.RackCode == obj.RackCode);
                if (chkExist)
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Thùng chọn đã được xếp vào vị trí của kệ này"));
                }
                else
                {
                    var boxBase = _context.EDMSBoxs.FirstOrDefault(x => x.BoxCode == obj.BoxCode);
                    if (boxBase != null)
                    {
                        var rack = _context.EDMSRacks.FirstOrDefault(x => x.RackCode == obj.RackCode);
                        var line = _context.EDMSLines.FirstOrDefault(x => x.LineCode == rack.LineCode);
                        var floor = _context.EDMSFloors.FirstOrDefault(x => x.FloorCode == line.FloorCode);

                        boxBase.RackCode = obj.RackCode;
                        boxBase.LineCode = line.LineCode;
                        boxBase.FloorCode = floor.FloorCode;
                        boxBase.WHS_Code = floor.WHS_Code;

                        _context.EDMSBoxs.Update(boxBase);

                        var box = _context.EDMSEntityMappings.FirstOrDefault(x => x.BoxCode == obj.BoxCode);
                        if (box != null)
                        {
                            EDMSMoveBoxLog objLog = new EDMSMoveBoxLog();
                            objLog.RackCodeOld = box.RackCode;
                            objLog.BoxCode = box.BoxCode;
                            objLog.RackCodeNew = obj.RackCode;
                            //objLog.RackPosition = box.RackPosition;
                            //objLog.Ordering = box.Ordering;
                            objLog.CreatedBy = ESEIM.AppContext.UserName;
                            objLog.CreatedTime = DateTime.Now;

                            _context.EDMSMoveBoxLogs.Add(objLog);

                            box.WHS_Code = floor.WHS_Code;
                            box.FloorCode = floor.FloorCode;
                            box.LineCode = line.LineCode;
                            box.RackCode = obj.RackCode;
                            box.BoxCode = obj.BoxCode;
                            box.RackPosition = null;
                            box.Ordering = null;

                            _context.EDMSEntityMappings.Update(box);
                        }
                        else
                        {
                            EDMSEntityMapping objNew = new EDMSEntityMapping();
                            objNew.WHS_Code = floor.WHS_Code;
                            objNew.FloorCode = floor.FloorCode;
                            objNew.LineCode = line.LineCode;
                            objNew.RackCode = obj.RackCode;
                            objNew.BoxCode = obj.BoxCode;
                            objNew.RackPosition = null;
                            objNew.Ordering = null;

                            _context.EDMSEntityMappings.Add(objNew);

                            EDMSMoveBoxLog objLog = new EDMSMoveBoxLog();
                            objLog.BoxCode = objNew.BoxCode;
                            objLog.RackCodeOld = null;
                            objLog.RackCodeNew = objNew.RackCode;
                            //objLog.RackPosition = objNew.RackPosition;
                            //objLog.Ordering = objNew.Ordering;
                            objLog.CreatedBy = ESEIM.AppContext.UserName;
                            objLog.CreatedTime = DateTime.Now;

                            _context.EDMSMoveBoxLogs.Add(objLog);
                        }

                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("Đổi vị trí thùng thành công"));
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("Lỗi không lấy được thông tin thùng"));
                    }
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Lỗi khi đổi vị trí thùng"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListBox()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var query = (from b in _context.EDMSBoxs
                             join c1 in _context.EDMSRacks on b.RackCode equals c1.RackCode into c2
                             from c in c2.DefaultIfEmpty()
                             join d1 in _context.EDMSLines on b.LineCode equals d1.LineCode into d2
                             from d in d2.DefaultIfEmpty()
                             join e1 in _context.EDMSFloors on b.FloorCode equals e1.FloorCode into e2
                             from e in e2.DefaultIfEmpty()
                             join f1 in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "RV") on b.WHS_Code equals f1.WHS_Code into f2
                             from f in f2.DefaultIfEmpty()
                             join h1 in _context.AdOrganizations on b.DepartCode equals h1.OrgAddonCode into h2
                             from h in h2.DefaultIfEmpty()
                             join j1 in _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "DOC_TYPE") on b.TypeProfile equals j1.SettingID.ToString() into j2
                             from j in j2.DefaultIfEmpty()
                             select new
                             {
                                 b.Id,
                                 WHS_Name = f.WHS_Name,
                                 FloorName = e.FloorName,
                                 L_Text = d.L_Text,
                                 RackName = c.RackName,
                                 BoxCode = b.BoxCode,
                                 NumBoxth = b.NumBoxth,
                                 StatusSecurity = b.StatusSecurity,
                                 StartTime = b.StartTime.HasValue ? b.StartTime.Value.ToString("dd/MM/yyyy") : "",
                                 OrgName = h.OrgName,
                                 TypeProfileName = j.ValueSet,
                             }).OrderByDescending(x => x.Id);
                msg.Object = query;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListRack()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var query = from c in _context.EDMSRacks
                            join d in _context.EDMSLines on c.LineCode equals d.LineCode
                            join e in _context.EDMSFloors on d.FloorCode equals e.FloorCode
                            join f in _context.EDMSWareHouses.Where(x => x.WHS_Flag != true && x.Type == "RV") on e.WHS_Code equals f.WHS_Code
                            select new
                            {
                                WHS_Name = f.WHS_Name,
                                FloorName = e.FloorName,
                                L_Text = d.L_Text,
                                RackName = c.RackName,
                                RackCode = c.RackCode,
                            };
                msg.Object = query;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }

        //Tạo mã QR_Code
        [HttpPost]
        public byte[] GeneratorQRCode(string code)
        {
            return CommonUtil.GeneratorQRCode(code);
        }
    }
    public class EDMSMoveBoxInsert
    {
        public string BoxCode { get; set; }
        public string RackCode { get; set; }
        public string Note { get; set; }

    }
}