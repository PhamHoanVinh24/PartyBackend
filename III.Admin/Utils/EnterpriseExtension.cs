using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Net.Http;
using System.Threading.Tasks;

namespace ESEIM.Utils
{
    /// <summary>
    /// Document https://thongtindoanhnghiep.co/rest-api
    /// </summary>
    public static class EnterpriseExtension
    {
        /// <summary>
        /// Lấy về toàn bộ danh mục Tỉnh/Thành phố
        /// </summary>
        public static async Task<EnterpriseResponse> GetDetailCompany(string url, string taxCode)
        {
            EnterpriseResponse result = new EnterpriseResponse();
            HttpClient httpClient = new HttpClient { BaseAddress = new Uri(url) };
            //httpClient.DefaultRequestHeaders.Add("user-agent", "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.2; .NET CLR 1.0.3705;)");
            //httpClient.DefaultRequestHeaders.Add("Referer", "http://www.microsoft.com");
            HttpResponseMessage httpResult = await httpClient.GetAsync(
               String.Format("/api/company/{0}", taxCode));
            var result1 = await httpResult.Content.ReadAsStringAsync();
            result = JsonConvert.DeserializeObject<EnterpriseResponse>(result1);
            return result;
        }
        /// <summary>
        /// Lấy về chi tiết một Tỉnh/Thành phố
        /// </summary>
        /// <param name="id"></param>
        //public static GetDetailCity(int id)
        //{

        //}

        /// <summary>
        /// Lấy về toàn bộ Quận/Huyện theo Tỉnh/Thành phố
        /// </summary>
        /// <param name="id"></param>
        //public static GetAllDistrict(int id)
        //{

        //}
    }
    public class EnterpriseResponse
    {
        [Column("MaSoThue")]
        public string MaSoThue { get; set; }

        [Column("NgayCap")]
        public string NgayCap { get; set; }

        [Column("DiaChiCongTy")]
        public string DiaChiCongTy { get; set; }

        [Column("Title")]
        public string Title { get; set; }

        [Column("NoiDangKyQuanLy_DienThoai")]
        public string NoiDangKyQuanLy_DienThoai { get; set; }

        [Column("NoiDangKyQuanLy_Fax")]
        public string NoiDangKyQuanLy_Fax { get; set; }
    }
}
