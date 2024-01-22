using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("URENCO_CAR_MANAGER")]
    public class UrencoCarManager
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public string CarPlate { get; set; }
        public string Driver { get; set; }
        public string Router { get; set; }
        public string MachineRunCNT { get; set; }
        public string KmRun { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string Branch { get; set; }
        public string Unit { get; set; }
        public string Shift { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
        public int Quantity { get; set; }
        public string ObjActCode { get; set; }
        public string TicketCode { get; set; }
        public string Title { get; set; }
        public int Caburant { get; set; }
        public string CaburantType { get; set; }
    }
}
