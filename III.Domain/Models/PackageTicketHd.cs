using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PACKAGE_TICKET_HD")]
    public class PackageTicketHd
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string TicketCode { get; set; }

        [StringLength(255)]
        public string TicketTitle { get; set; }

        [StringLength(255)]
        public string TicketCreator { get; set; }

        public DateTime? TicketTimeCreator { get; set; }

        [StringLength(255)]
        public string Packager { get; set; }

        public DateTime? PackagerTime { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        public string Noted { get; set; }
    }
}
