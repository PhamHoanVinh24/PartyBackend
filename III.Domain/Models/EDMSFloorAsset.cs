using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("EDMS_FLOOR_ASSET")]
    public class EDMSFloorAsset
    { 
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string FloorCode { get; set; }

        [StringLength(255)]
        public string FloorName { get; set; }

        public string QR_Code { get; set; }

        [StringLength(255)]
        public string AreaSquare { get; set; }

        public string MapDesgin { get; set; }

        [StringLength(255)]
        public string Note { get; set; }

        public string Image { get; set; }

        public int CNT_Line { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        [StringLength(255)]
        public string WHS_Code { get; set; }

        [StringLength(255)]
        public string ManagerId { get; set; }

        [StringLength(255)]
        public string Temperature { get; set; }

        [StringLength(255)]
        public string Humidity { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }
    }
}
