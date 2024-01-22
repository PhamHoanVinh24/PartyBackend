using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("IWINDOOR_KEYGEN_MANAGEMENT")]
    public class IwindoorKeygenManagement
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string MacCode { get; set; }

        public string HardDriveCode { get; set; }

        public string  KeyAccess{ get; set; }
        public string ComputerName { get; set; }


        public bool? Status { get; set; }

        public DateTime? CreatedTime { get; set; }
    }
}
