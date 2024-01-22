using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("EDMS_RACK_DOCUMENT")]
    public class EDMSRackDocument
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string RackCode { get; set; }

        [StringLength(255)]
        public string RackName { get; set; }

        [StringLength(255)]
        public string QR_Code { get; set; }

        [StringLength(255)]
        public string R_Size { get; set; }

        [StringLength(255)]
        public string R_Status { get; set; }

        public int CNT_Box { get; set; }

        [StringLength(255)]
        public string CNT_Cell { get; set; }

        [StringLength(255)]
        public string Note { get; set; }

        [StringLength(255)]
        public string LineCode { get; set; }

        [StringLength(255)]
        public string Material { get; set; }

        [StringLength(255)]
        public string Ordering { get; set; }
    }

    public class EDMSRackDocumentModel : EDMSRackDocument
    {
        public string RackPositionText { get; set; }
    }
}
