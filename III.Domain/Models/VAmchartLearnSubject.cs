using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("V_AMCHART_LEARN_SUBJECT")]
    public class VAmchartLearnSubject
    {
        [Key]
        public Guid ID { get; set; }
        public string CreatedBy { get; set; }
        public int UserCount { get; set; }
        public int LstMonth { get; set; }
    }
}
