-- Increase community MOTD line limits from 100 to 500 characters.
alter table public.motd_templates
    drop constraint if exists motd_templates_line1_check,
    drop constraint if exists motd_templates_line2_check;

alter table public.motd_templates
    add constraint motd_templates_line1_check
        check (char_length(line1) between 1 and 500 and char_length(btrim(line1)) > 0),
    add constraint motd_templates_line2_check
        check (char_length(line2) between 1 and 500 and char_length(btrim(line2)) > 0);
