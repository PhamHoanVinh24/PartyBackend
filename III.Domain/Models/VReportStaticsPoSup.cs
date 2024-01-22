using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("V_REPORT_STATICS_PO_SUP")]
    public class VReportStaticsPoSup
    {
        [Key]
        public Guid Id { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string Category { get; set; }
        public string CategoryName { get; set; }
        public string ProductType { get; set; }
        public int? Quantity { get; set; }
        public int? QuantityNeedImpExp { get; set; }
        public decimal? Cost { get; set; }
        public string Unit { get; set; }
        public string UnitName { get; set; }
        public string Type { get; set; }
        public string HeaderCode { get; set; }
        public string HeaderName { get; set; }
        public string PoCode { get; set; }
        public string PoName { get; set; }
        public string CusCode { get; set; }
        public string CusName { get; set; }
        public string SupCode { get; set; }
        public string SupName { get; set; }
        public DateTime? CreatedTime { get; set; }
    }
}
