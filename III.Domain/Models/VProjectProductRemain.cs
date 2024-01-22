using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("V_PROJECT_PRODUCT_REMAIN")]
    public class VProjectProductRemain
    {
        [Key]
        public Guid Id { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string Unit { get; set; }
        public string UnitName { get; set; }
        public string ProjectCode { get; set; }
        public string ProjectTitle { get; set; }
        public decimal? TotalRemain { get; set; }
    }
}
