using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("URENCO_NODE_RUBBUSH_MAPPING")]
    public class UrencoNodesRubbishMapping
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string NodeCode { get; set; }

        [StringLength(255)]
        public string BinCode { get; set; }
    }
}
