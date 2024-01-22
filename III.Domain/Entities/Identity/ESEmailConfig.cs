using System;
using System.Collections.Generic;

namespace Host.Entities
{
    public partial class ESEmailConfig
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Title { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Smtp { get; set; }
        public int? Smtpport { get; set; }
        public bool? Smtpssl { get; set; }
        public string Pop3 { get; set; }
        public int? Pop3port { get; set; }
        public bool? Pop3ssl { get; set; }
        public string Imap { get; set; }
        public int? Imapport { get; set; }
        public bool? Imapssl { get; set; }
    }
}
