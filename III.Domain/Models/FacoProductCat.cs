using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("FACO_PRODUCT_CAT")]
    public class FacoProductCat
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProductID { get; set; }

        [StringLength(100)]
        public string ProductCode { get; set; }

        [StringLength(255)]
        public string ProductName { get; set; }

        [StringLength(50)]
        public string Unit { get; set; }

        [StringLength(500)]
        public string PathImg { get; set; }

        [StringLength(500)]
        public string Note { get; set; }

        [StringLength(100)]
        public string ProductGroup { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }
        

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }
        

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }
        

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }


        public string Color { get; set; }
        public string TradeMark { get; set; }
        public string Origin { get; set; }
        public string Material { get; set; }
        public string UserManual { get; set; }
        public double Cost { get; set; }

    }

    public class FacoSearchModel
    {
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string ProductGroup { get; set; }
        public string FromCost { get; set; }
        public string ToCost { get; set; }
        public string Color { get; set; }
        public string TradeMark { get; set; }
        public string Origin { get; set; }
        public string Material { get; set; }
        public int Page { get; set; }
        public int Length { get; set; }
    }
}
