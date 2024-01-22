using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSDiagramController : BaseController
    {
        private readonly EIMDBContext _context;

        public EDMSDiagramController(EIMDBContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public object JTable([FromBody]JTableModel jTablePara)
        {
            Dictionary<string, object> dictionary = new Dictionary<string, object>();
            dictionary.Add("draw", 1);
            dictionary.Add("recordsFiltered", 5);
            dictionary.Add("recordsTotal", 5);
            Dictionary<string, string> data = new Dictionary<string, string>();
            List<object> datas = new List<object>();
            data.Add("Id", "1");
            data.Add("Code", "123");
            data.Add("Unit", "Bộ phận quốc phòng");
            data.Add("FromDate", "18/01/2019");
            data.Add("ToDate", "20/01/2019");
            data.Add("Sender", "Phan Duy Dương");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "2");
            data.Add("Code", "Tl");
            data.Add("Unit", "Công ty Tam Long");
            data.Add("FromDate", "18/01/2019");
            data.Add("ToDate", "25/01/2019");
            data.Add("Sender", "Đỗ Đình Hiệp");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "3");
            data.Add("Code", "Tl");
            data.Add("Unit", "Cửa hàng 1");
            data.Add("FromDate", "19/01/2019");
            data.Add("ToDate", "29/01/2019");
            data.Add("Sender", "Nguyễn Ngọc Hoàng");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "4");
            data.Add("Code", "Code2");
            data.Add("Unit", "Cửa hàng 2");
            data.Add("FromDate", "20/01/2019");
            data.Add("ToDate", "26/01/2019");
            data.Add("Sender", "Trần Tuấn Anh");
            datas.Add(data);

            data = new Dictionary<string, string>();
            data.Add("Id", "5");
            data.Add("Code", "Code3");
            data.Add("Unit", "Cửa hảng 3");
            data.Add("FromDate", "21/01/2019");
            data.Add("ToDate", "29/01/2019");
            data.Add("Sender", "Đỗ Văn Quỳnh");
            datas.Add(data);

            dictionary.Add("data", datas);
            return Json(dictionary);
        }
    }
}