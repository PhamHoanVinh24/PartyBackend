using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("V_AMCHART_BUY")]
    public class VAmchartBuy
    {
        [Key]
        public Guid ID { get; set; }
        public string Status { get; set; }
        public int StatusCount { get; set; }
        public int LstMonth { get; set; }
    }
}
