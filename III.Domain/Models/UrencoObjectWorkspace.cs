using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("URENCO_OBJECT_WORKSPACE")]
    public class UrencoObjectWorkspace
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string CarCode { get; set; }

        [StringLength(255)]
        public string ObjectType { get; set; }

        [StringLength(255)]
        public string ObjectCode { get; set; }

        [StringLength(255)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        public bool IsDeleted { get; set; }
        public string ObjectCodeName { get; set; }

    }
}
