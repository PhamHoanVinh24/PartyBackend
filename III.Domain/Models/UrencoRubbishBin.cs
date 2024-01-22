using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("URENCO_RUBBISH_BIN")]
    public class UrencoRubbishBin
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string BinCode { get; set; }

        [StringLength(255)]
        public string BinName { get; set; }

        public double Volume { get; set; }

        [StringLength(50)]
        public string Material { get; set; }

        public string Structure { get; set; }

        public string QrCode { get; set; }
        public string LastGps { get; set; }
        public string Note { get; set; }
        public string Status { get; set; }
        public string BinType { get; set; }
        public double PercentageUsed { get; set; }
        public string CurGps { get; set; }
        public int? WorkerManage { get; set; }
        public DateTime CreatedTime { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }
        [StringLength(50)]
        public DateTime? DeletedTime { get; set; }
        public string DeletedBy { get; set; }
        public bool IsDeleted { get; set; }
        public string Image { get; set; }
    }
}
