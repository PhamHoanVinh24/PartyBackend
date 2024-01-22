
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("REQUEST_IMP_PRODUCT_DETAIL")]
    public class RequestImpProductDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string ReqCode { get; set; }

        [StringLength(255)]
        public string ProductCode { get; set; }
        [NotMapped]
        public string ProductName { get; set; }
        public string ProductType { get; set; }

        [StringLength(255)]
        public string PoCount { get; set; }

        public decimal? RateConversion { get; set; }

        public decimal? RateLoss { get; set; }

        public decimal Quantity { get; set; }

        [StringLength(50)]
        public string Unit { get; set; }
        [NotMapped]
        public decimal? UnitPrice { get; set; }
        [NotMapped]
        public string UnitName { get; set; }

        [StringLength(500)]
        public string Note { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public string SupCode { get; set; }
        public DateTime? ExpectedDate { get; set; }
        [NotMapped]
        public string sExpectedDate { get; set; }
        public bool IsDeleted { get; set; }
    }

    public class RequestImpProductDetailExport
    {
        public int No { get; set; }
        //public string ReqCode { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string SupName { get; set; }
        public string Title { get; set; }
        public string PoCount { get; set; }
        public decimal? RateConversion { get; set; }
        public decimal? RateLoss { get; set; }
        public decimal Quantity { get; set; }
        public string Unit { get; set; }
        public string ExpectedDate { get; set; }
        public string CreatedTime { get; set; }
        public string Note { get; set; }
    }

    public class RequestImpProductDetailExportManufacurer
    {
        public int No { get; set; }
        //public string ReqCode { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string SupName { get; set; }
        public decimal Quantity { get; set; }
        public string Unit { get; set; }
        public string Note { get; set; }
    }
}
