using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSWareHouseProfileVouchers1Controller : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;

        public EDMSWareHouseProfileVouchers1Controller(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;

        }
        public IActionResult Index()
        {
            return View();
        }

        #region Ware House
        [HttpPost]
        public object JTable([FromBody]EDMSWareHouseJtableSearchModel jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.EDMSWareHouses
                        where (string.IsNullOrEmpty(jTablePara.WHS_Code) || a.WHS_Code.ToLower().Contains(jTablePara.WHS_Code.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.WHS_Name) || a.WHS_Name.ToLower().Contains(jTablePara.WHS_Name.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.WHS_AreaSquare) || a.WHS_AreaSquare.ToLower().Contains(jTablePara.WHS_AreaSquare.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.WHS_ADDR_Text) || a.WHS_ADDR_Text.ToLower().Contains(jTablePara.WHS_ADDR_Text.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.WHS_Note) || a.WHS_Note.ToLower().Contains(jTablePara.WHS_Note.ToLower()))
                            && (string.IsNullOrEmpty(jTablePara.WHS_Tags) || a.WHS_Tags.ToLower().Contains(jTablePara.WHS_Tags.ToLower()))
                            && a.WHS_Flag == false
                        select new
                        {
                            a.Id,
                            a.WHS_Code,
                            a.WHS_Name,
                            a.WHS_ADDR_Text,
                            a.WHS_CNT_Floor,
                            a.WHS_Note,
                        };
            var count = query.Count();
            var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "WHS_Code", "WHS_Name", "WHS_ADDR_Text", "WHS_CNT_Floor", "WHS_Note");
            return Json(jdata);
        }

        [HttpGet]
        public JsonResult GetItem(string code)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.EDMSWareHouses.AsNoTracking().Single(m => m.WHS_Code == code);
                msg.Object = data;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                //msg.Title = "Có lỗi khi lấy dữ liệu!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DATA_FAIL"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Insert(EDMSWareHouse obj, IFormFile imageUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };
            if (imageUpload != null)
            {
                var upload = _upload.UploadImage(imageUpload);
                if (upload.Error)
                {
                    msg.Error = true;
                    msg.Title = upload.Title;
                    return Json(msg);
                }
                else
                {
                    obj.IMG_WHS = "/uploads/Images/" + upload.Object.ToString();
                }
            }
            _context.EDMSWareHouses.Add(obj);
            _context.SaveChanges();
            //msg.Title = "Thêm mới kho dữ liệu thành công";
            msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"),CommonUtil.ResourceValue("EDMSWHPV_CURD_LBL_WHS_NAME_DATA"));
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Update(EDMSWareHouse objModel, IFormFile imageUpload)
        {
            var msg = new JMessage { Error = false, Title = "" };

            var obj = _context.EDMSWareHouses.FirstOrDefault(x => x.Id == objModel.Id);
            if (obj != null)
            {
                if (imageUpload != null)
                {
                    var upload = _upload.UploadImage(imageUpload);
                    if (upload.Error)
                    {
                        msg.Error = true;
                        msg.Title = upload.Title;
                        return Json(msg);
                    }
                    else
                    {
                        obj.IMG_WHS = "/uploads/Images/" + upload.Object.ToString();
                    }
                }
                obj.WHS_Name = objModel.WHS_Name;
                obj.WHS_ADDR_Gps = objModel.WHS_ADDR_Gps;
                obj.WHS_ADDR_Text = objModel.WHS_ADDR_Text;
                obj.WHS_AreaSquare = objModel.WHS_AreaSquare;
                obj.WHS_CNT_Floor = objModel.WHS_CNT_Floor;
                obj.WHS_Tags = objModel.WHS_Tags;
                obj.WHS_Note = objModel.WHS_Note;

                _context.Update(obj);
                _context.SaveChanges();
                //msg.Title = "Cập nhập kho dữ liệu thành công !";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"),CommonUtil.ResourceValue("EDMSWHPV_CURD_LBL_WHS_NAME_DATA"));
            }
            else
            {
                msg.Error = true;
                //msg.Title = "Không tìm thấy kho trong CSDL !";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_FOUND_DATA"));
            }
            
            return Json(msg);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.EDMSWareHouses.FirstOrDefault(x => x.Id == id);
                if (data != null)
                {
                    data.WHS_Flag = true;
                    _context.EDMSWareHouses.Update(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    //msg.Title = "Xóa kho dữ liệu thành công!";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"),CommonUtil.ResourceValue("EDMSWHPV_CURD_LBL_WHS_NAME_DATA"));
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Kho đã bị xóa!";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS_FILE"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi xóa!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_DELETE"));
            }
            return Json(msg);
        }
        #endregion
    }
}