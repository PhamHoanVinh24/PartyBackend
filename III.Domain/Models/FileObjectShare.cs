using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("EDMS_OBJECT_SHARE_FILE")]
    public class EDMSObjectShareFile
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255), Required]
        public string ObjectType { get; set; }

        [StringLength(255), Required]
        public string ObjectCode { get; set; }

        [StringLength(255),Required]
        public string ObjectCodeShared { get; set; }

        [StringLength(255), Required]
        public string ObjectTypeShared { get; set; }

        [StringLength(255), Required]
        public string FileCode { get; set; }

        [StringLength(255)]
        public string FileName { get; set; }

        [StringLength(255)]
        public string FilePath { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }
    }
}
