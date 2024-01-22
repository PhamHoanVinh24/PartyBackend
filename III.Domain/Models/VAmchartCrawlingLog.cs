using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("V_AMCHART_CRAWLING_LOG")]
    public class VAmchartCrawlingLog
    {
        [Key]
        public Guid ID { get; set; }
        public int SumPasscap { get; set; }
        public int SumTimeScan { get; set; }
        public int SumUrl { get; set; }
        public int SumFile { get; set; }
        public int LstDay { get; set; }
    }
}
