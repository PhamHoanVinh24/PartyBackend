using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("EDMS_WHS_MEDIA")]
    public class EDMSWhsMedia
    { 
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string FileCode { get; set; }

        [StringLength(255)]
        public string FileName { get; set; }

        [StringLength(255)]
        public string FilePath { get; set; }

        [StringLength(255)]
        public string FileExt { get; set; }

        [StringLength(255)]
        public string FileSite { get; set; }

        [StringLength(255)]
        public string Note { get; set; }
    }
}
