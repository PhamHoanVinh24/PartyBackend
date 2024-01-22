using ESEIM.Models;
using ESEIM.Utils;

using FTU.Utils.HelperNet;
using III.Admin.Controllers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RMTrackingController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IRepositoryService _repositoryService;
        public RMTrackingController(EIMDBContext context, IRepositoryService repositoryService)
        {
            _context = context;
            _repositoryService = repositoryService;
        }
        public class JTableModelCustom : JTableModel
        {
            public string Ma_Remooc { get; set; }
            public string Ma_Theo_Doi { get; set; }
            public string Ngay_gio_den { get; set; }
            public string Ngay_gio_di { get; set; }
            public string Container_Code { get; set; }

        }
        string[] formats = { "dd/MM/yyyy", "d/MM/yyyy", "dd/M/yyyy", "dd/MM/yy", "d/MM/yy", "dd/M/yy" };
        public IActionResult Index()
        {
            ViewData["Message"] = "DANH SÁCH CHUYẾN ĐI";
            return View();
        }
        [HttpPost]
        //Quynh a
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var fromDate = !string.IsNullOrEmpty(jTablePara.Ngay_gio_di) ? DateTime.ParseExact(jTablePara.Ngay_gio_di, formats, new CultureInfo("vi-VN"), DateTimeStyles.None) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.Ngay_gio_den) ? DateTime.ParseExact(jTablePara.Ngay_gio_den, formats, new CultureInfo("vi-VN"), DateTimeStyles.None) : (DateTime?)null;

            //var company_code = HttpContext.GetSessionUser()?.CompanyCode;
            var query = (from a in _context.RmRemoocTrackings
                         join b in _context.RmRomoocDrivers on a.DriveId equals b.Id 
                        join c in _context.RmCancelTrackings on a.TripCode equals c.TripCode into b2
                        from b1 in b2.DefaultIfEmpty()                        
                        where a.CompanyCode == company_code && (jTablePara.Ma_Theo_Doi == null || jTablePara.Ma_Theo_Doi == "" || a.TripCode.ToLower().Contains(jTablePara.Ma_Theo_Doi.Trim().ToLower()) || b.Name.ToLower().Contains(jTablePara.Ma_Theo_Doi.Trim().ToLower()))
                                && (jTablePara.Ma_Remooc == null || jTablePara.Ma_Remooc == "" || a.TractorCode.ToLower().Contains(jTablePara.Ma_Remooc.Trim().ToLower()) || a.RemoocCode.ToLower().Contains(jTablePara.Ma_Remooc.Trim().ToLower()))
                               && (jTablePara.Container_Code == null || jTablePara.Container_Code == "" || a.ContainerCode.Contains(jTablePara.Container_Code))
                                && (fromDate == null || a.StartPositionTime.Value.Date >= fromDate.Value.Date)
                                && (toDate == null || toDate.Value.Date >= a.StartPositionTime.Value.Date)
                        select new TrackingInfo
                        {
                            Id = a.Id,
                            Trip_code = a.TripCode != null ? a.TripCode : "",
                            Name = b.Name != null ? b.Name : "",
                            Tractor_code = a.TractorCode != null ? a.TractorCode : "",
                            Remooc_code = a.RemoocCode != null ? a.RemoocCode : "",
                            container_code = a.ContainerCode != null ? a.ContainerCode : "",
                            Imgcontain1 = a.Imgcontain1 != null ? "http://117.6.131.222:4010" + a.Imgcontain1 : "",
                            Imgcontain2 = a.Imgcontain2 != null ? "http://117.6.131.222:4010" + a.Imgcontain2 : "",
                            Start_position_text = a.StartPositionText != null ? a.StartPositionText : "",
                            Start_position_code = a.StartPositionCode != null ? a.StartPositionCode : "",
                            Start_position_time = a.StartPositionTime,
                            End_position_text = a.EndPositionText != null ? a.EndPositionText : "",
                            End_position_code = a.EndPositionCode != null ? a.EndPositionCode : "",
                            End_position_time = a.EndPositionTime,
                            Status = a.Status != null ? a.Status : "",
                            Type_Trip = a.TypeTrip,
                            Ma_Theo_Doi = a.MaTheoDoi,
                            Note = b1 != null ? b1.ReasonCancel : ""
                        });
            List<TrackingInfo> result = query.ToList() as List<TrackingInfo>;
            var resson_cancel_tracking = _context.RmCommentSettings.Where(x=>x.Group.ToLower().Contains("resson_cancel_tracking")).ToList();
            foreach (var item in result)
            {
                if (item.Note !="")
                {
                    var a = resson_cancel_tracking.FirstOrDefault(x=>x.Name.ToLower().Contains(item.Note.ToLower()));
                    if (a!=null)
                    {
                        item.Note = a.Value;
                    }
                }
            }
            var count = result.Count();
            var data = result.OrderByDescending(x=>x.Id)
                .Skip(intBeginFor).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Trip_code", "Name", "Tractor_code", "Remooc_code", "Start_position_text", "Start_position_code", "Start_position_time", "End_position_text", "End_position_code", "End_position_time", "Status", "Type_Trip", "Ma_Theo_Doi", "Note", "container_code", "Imgcontain1", "Imgcontain2");
            return Json(jdata);
        }
        //int Id, string lat,string lng, string lat1,string lng2
       
        [HttpPost]
        public async System.Threading.Tasks.Task<JsonResult> GetDistanceBetweenTwoPointAsync(string Tractor_Code, string Remooc_Code, string origin,  string des)
        {
            JMessage message = new JMessage();
            string a = origin.Replace("]", "").Replace("[","");
            var originLat = a.Split(',')[1];
            var originLng = a.Split(',')[0];
            string b = des.Replace("]", "").Replace("[", "");
            var desLat = b.Split(',')[1];
            var desLng = b.Split(',')[0];
            string url = @"https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=" + originLat + "," + originLng + "&destinations=" + desLat + "," + desLng + "&key=" +CommonUtil.GetGoogleDistanceMatrixKey();
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            WebResponse response = await request.GetResponseAsync();
            Stream dataStream = response.GetResponseStream();
            StreamReader sreader = new StreamReader(dataStream);
            string responsereader = sreader.ReadToEnd();
            try
            {
                var result = JsonConvert.DeserializeObject<DistanceMatrixResponse>(responsereader);
                if(result.Status == "OK") 
                {
                    var distance = result.Rows[0].Elements[0].Distance.Value;
                    //var distance = 100;
                    var tractor = _context.RmRemoocTractors.FirstOrDefault(x => x.Code == Tractor_Code);
                    if (tractor != null)
                    {

                        tractor.SumDistance = tractor.SumDistance + distance;
                        _context.RmRemoocTractors.Update(tractor);
                    }
                    var remooc = _context.RmRemoocRemoocs.FirstOrDefault(x => x.Code == Remooc_Code);
                    if (remooc != null)
                    {

                        remooc.SumDistance = remooc.SumDistance + distance;
                        _context.RmRemoocRemoocs.Update(remooc);
                    }
                    _context.SaveChanges();

                    message.ID = 1;
                    message.Object = result;
                }
                else
                {
                    message.ID = 0;
                    message.Title = "Key đã hết hạn";
                }
            }catch(Exception ex)
            {
                message.ID = 0;
                message.Title = ex.Message;
            }
            return Json(message);
        }


    }
    public class TrackingInfo
    {
      public Int32 Id { get; set; }
       public string Trip_code { get; set; }
        public string Name { get; set; }
        public string Tractor_code { get; set; }
        public string Remooc_code { get; set; }
        public string container_code { get; set; }
        public string Start_position_text { get; set; }
        public string Start_position_code { get; set; }
        public DateTime? Start_position_time { get; set; }
        public string End_position_text { get; set; }
        public string End_position_code { get; set; }
        public DateTime? End_position_time { get; set; }
        public string Status { get; set; }
        public string Type_Trip { get; set; }
        public string Ma_Theo_Doi { get; set; }
        public string Note { get; set; }
        public string Imgcontain2 { get; set; }
        public string Imgcontain1 { get; set; }
    }
    public class DistanceMatrixResponse
    {
        [JsonProperty(PropertyName = "status")]
        public string Status { get; set; }

        [JsonProperty(PropertyName = "destination_addresses")]
        public string[] DestinationAddresses { get; set; }

        [JsonProperty(PropertyName = "origin_addresses")]
        public string[] OriginAddresses { get; set; }

        public Row[] Rows { get; set; }

        public class Data
        {
            public int Value { get; set; }
            public string Text { get; set; }
        }

        public class Element
        {
            public string Status { get; set; }
            public Data Duration { get; set; }
            public Data Distance { get; set; }
        }

        public class Row
        {
            public Element[] Elements { get; set; }
        }
    }
}