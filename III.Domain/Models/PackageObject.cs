using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PACKAGE_OBJECT")]
    public class PackageObject
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string PackCode { get; set; }

        [StringLength(255)]
        public string PackName { get; set; }

        [StringLength(255)]
        public string PackType { get; set; }

        [StringLength(255)]
        public string Specs { get; set; }

        public string Noted { get; set; }

        [StringLength(255)]
        public string CurrentPos { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        [StringLength(255)]
        public string PackCodeParent { get; set; }

        public string AttrPack { get; set; }

        [StringLength(255)]
        public string Level { get; set; }

        [StringLength(255)]
        public string NumPosition { get; set; }

        [StringLength(255)]
        public string StatusReady { get; set; }
        [StringLength(255)]
        public string PackLot { get; set; }
    }
}
