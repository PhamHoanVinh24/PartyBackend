using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("V_AMCHART_DO_EXERCISE")]
    public class VAmchartDoExercise
    {
        [Key]
        public Guid ID { get; set; }
        public string CreatedBy { get; set; }
        public bool? Result { get; set; }
        public string TypeTraining { get; set; }
        public int TypeCount { get; set; }
        public int LstMonth { get; set; }
    }
}
