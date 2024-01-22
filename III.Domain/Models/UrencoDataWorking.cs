using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("URENCO_DATA_WORKING")]
    public class UrencoDataWorking
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string ShiftCode { get; set; }
        public string ActivityCode{ get; set; }
        public string CarCode { get; set; }
        public DateTime? StartLocationTime{ get; set; }
        public string StartLocationGps{ get; set; }
        public string StartLocationText { get; set; }
        public string StartLocationNodeCode{ get; set; }
        public DateTime? EndLocationTime { get; set; }
        public string EndLocationGps { get; set; }
        public string EndLocationText { get; set; }
        public string EndLocationNodeCode { get; set; }
        public string AmountQuantity{ get; set; }
        public string AmountUnit{ get; set; }
        public DateTime? CreatedTime{ get; set; }
        public string CreatedBy{ get; set; }
        public string Driver { get; set; }
        public string ObjCode { get; set; }
    }
}
