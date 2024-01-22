using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("VC_CUSTOMER_CARE_LAST_MONTH")]
    public class VcCustomerCareLastMonth
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(10)]
        public string YearMonth { get; set; }

        [StringLength(100)]
        public string CusCode { get; set; }

        [StringLength(100)]
        public string BrandCode { get; set; }

        [StringLength(100)]
        public string ProductCode { get; set; }

        public decimal? ConsumpMonthly { get; set; }
        public decimal? Instock { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        [StringLength(50)]
        public string Username { get; set; }
    }
}